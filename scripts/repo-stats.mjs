#!/usr/bin/env node
/**
 * Print GitHub traffic and popularity for this repository.
 *
 * Requires the GitHub CLI to be installed and authenticated (`gh auth login`).
 * No token is stored in the repository.
 *
 * Usage:
 *   npm run stats:repo
 *   GITHUB_REPO=owner/name npm run stats:repo
 */
import { execFileSync } from "node:child_process";

const repo = process.env.GITHUB_REPO || "rivaldoismir/drawblock";

function gh(path) {
  const endpoint = path ? `repos/${repo}/${path}` : `repos/${repo}`;
  const output = execFileSync(
    "gh",
    ["api", endpoint, "--header", "Accept: application/vnd.github+json"],
    { encoding: "utf8" },
  );
  return JSON.parse(output);
}

function safe(label, fn) {
  try {
    return fn();
  } catch (error) {
    const message = error?.stderr?.toString().trim() || error.message;
    console.warn(`[${label}] ${message}`);
    return null;
  }
}

function number(value) {
  return new Intl.NumberFormat("id-ID").format(value ?? 0);
}

console.log(`\nDrawBlock — GitHub stats for ${repo}\n${"=".repeat(52)}\n`);

const meta = safe("repo", () => gh(""));
if (meta) {
  console.log(`Stars       : ${number(meta.stargazers_count)}`);
  console.log(`Forks       : ${number(meta.forks_count)}`);
  console.log(`Watchers    : ${number(meta.subscribers_count)}`);
  console.log(`Open issues : ${number(meta.open_issues_count)}`);
  console.log(`License     : ${meta.license?.spdx_id ?? "none"}`);
  console.log("");
}

const views = safe("views", () => gh("traffic/views"));
if (views) {
  console.log(`Views (14d) : ${number(views.count)} total, ${number(views.uniques)} unique`);
}

const clones = safe("clones", () => gh("traffic/clones"));
if (clones) {
  console.log(`Clones (14d): ${number(clones.count)} total, ${number(clones.uniques)} unique`);
}

const referrers = safe("referrers", () => gh("traffic/popular/referrers"));
if (referrers?.length) {
  console.log("\nTop referrers:");
  for (const item of referrers.slice(0, 5)) {
    console.log(`  ${item.referrer.padEnd(28)} ${number(item.count)} views / ${number(item.uniques)} unique`);
  }
}

const paths = safe("paths", () => gh("traffic/popular/paths"));
if (paths?.length) {
  console.log("\nPopular repository paths:");
  for (const item of paths.slice(0, 5)) {
    console.log(`  ${item.path.padEnd(40)} ${number(item.count)} views / ${number(item.uniques)} unique`);
  }
}

const releases = safe("releases", () => gh("releases"));
if (releases?.length) {
  console.log("\nRelease downloads:");
  for (const release of releases.slice(0, 5)) {
    const downloads = (release.assets ?? []).reduce(
      (sum, asset) => sum + (asset.download_count ?? 0),
      0,
    );
    console.log(`  ${release.tag_name.padEnd(16)} ${number(downloads)} downloads`);
  }
}

console.log("\nNote: GitHub Traffic only covers the last 14 days.");
console.log("App page views live in the Vercel dashboard → Analytics.");
console.log("See docs/ANALYTICS.md for details.\n");
