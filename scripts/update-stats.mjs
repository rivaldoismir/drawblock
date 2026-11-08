#!/usr/bin/env node
/**
 * Refresh the aggregate visit counters shown as badges in the README.
 *
 * Sources:
 *   - GitHub Traffic (repo views / clones) via the REST API.
 *   - Vercel Web Analytics (app page views / visitors) via the public API.
 *
 * No visitor identities are collected. The Vercel step is skipped when
 * VERCEL_TOKEN or VERCEL_PROJECT_ID is not configured, and the existing badge
 * value is kept.
 *
 * Environment:
 *   GITHUB_TOKEN        token with access to the repository (Actions provides it)
 *   GITHUB_REPO         owner/name (defaults to rivaldoismir/drawblock)
 *   VERCEL_TOKEN        Vercel access token (optional)
 *   VERCEL_PROJECT_ID   Vercel project id, e.g. prj_... (optional)
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const repo = process.env.GITHUB_REPO || "rivaldoismir/drawblock";
// GITHUB_TOKEN cannot read the Traffic API (it returns 403). A classic PAT with
// `repo` scope, stored as TRAFFIC_TOKEN, is required for repo view/clone counts.
const ghToken = process.env.TRAFFIC_TOKEN || process.env.GITHUB_TOKEN || "";
const hasTrafficToken = Boolean(process.env.TRAFFIC_TOKEN);
const vercelToken = process.env.VERCEL_TOKEN || "";
const vercelProjectId = process.env.VERCEL_PROJECT_ID || "";
const outDir = fileURLToPath(new URL("../docs/stats/", import.meta.url));

const numberFormat = new Intl.NumberFormat("en-US");

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeBadge(file, label, value, color = "6965db") {
  const path = `${outDir}${file}`;
  const previous = await readJson(path, null);
  const message =
    typeof value === "number" && Number.isFinite(value)
      ? numberFormat.format(value)
      : "n/a";
  const next = {
    schemaVersion: 1,
    label,
    message,
    color: message === "n/a" ? "lightgrey" : color,
  };
  const serialized = `${JSON.stringify(next, null, 2)}\n`;
  if (previous && JSON.stringify(previous) === JSON.stringify(next)) {
    console.log(`[stats] ${file}: unchanged (${message})`);
    return;
  }
  await writeFile(path, serialized, "utf8");
  console.log(`[stats] ${file}: ${message}`);
}

async function github(path) {
  if (!ghToken) {
    console.warn("[stats] GITHUB_TOKEN is not set; skipping GitHub traffic.");
    return null;
  }
  const endpoint = path
    ? `https://api.github.com/repos/${repo}/${path}`
    : `https://api.github.com/repos/${repo}`;
  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${ghToken}`,
      "User-Agent": "drawblock-stats",
    },
  });
  if (!response.ok) {
    console.warn(`[stats] GitHub ${path}: ${response.status} ${response.statusText}`);
    return null;
  }
  return response.json();
}

async function vercelVisits() {
  if (!vercelToken || !vercelProjectId) {
    console.warn(
      "[stats] VERCEL_TOKEN or VERCEL_PROJECT_ID is missing; keeping app counters.",
    );
    return null;
  }
  const url = new URL("https://api.vercel.com/v1/query/web-analytics/visits/count");
  url.searchParams.set("projectId", vercelProjectId);
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${vercelToken}` },
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    console.warn(
      `[stats] Vercel analytics: ${response.status} ${response.statusText} ${detail}`,
    );
    return null;
  }
  const payload = await response.json();
  return payload?.data ?? null;
}

await mkdir(outDir, { recursive: true });

const views = await github("traffic/views");
if (views) {
  await writeBadge("repo-views.json", "repo views (14d)", views.count ?? null);
} else if (!hasTrafficToken) {
  await writeBadge("repo-views.json", "repo views (14d)", null);
}

const clones = await github("traffic/clones");
if (clones) {
  await writeBadge("repo-clones.json", "repo clones (14d)", clones.count ?? null);
} else if (!hasTrafficToken) {
  await writeBadge("repo-clones.json", "repo clones (14d)", null);
}

const visits = await vercelVisits();
if (visits) {
  await writeBadge("app-pageviews.json", "app page views", visits.pageviews ?? null);
  await writeBadge("app-visitors.json", "app visitors", visits.visitors ?? null);
}

console.log("[stats] done");
