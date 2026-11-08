import { describe, expect, it } from "vitest";
import { drawingHref, drawingLinkText, encodeHref, resolveHref } from "../services/linkTarget";

describe("linkTarget", () => {
  it("encodes spaces but keeps separators", () => {
    expect(encodeHref("arsitektur/New 1.excalidraw")).toBe(
      "arsitektur/New%201.excalidraw",
    );
  });

  it("builds relative hrefs from the note folder", () => {
    expect(drawingHref("a/b.md", "a/b/New 1.excalidraw")).toBe(
      "b/New%201.excalidraw",
    );
    expect(drawingHref("a/b/c.md", "a/New 1.excalidraw")).toBe(
      "../New%201.excalidraw",
    );
    expect(drawingHref("README.md", "arsitektur/alur.excalidraw")).toBe(
      "arsitektur/alur.excalidraw",
    );
  });

  it("resolves drawing links back to workspace paths", () => {
    expect(resolveHref("a/b.md", "New%201.excalidraw")).toEqual({
      kind: "drawing",
      path: "a/New 1.excalidraw",
    });
    expect(resolveHref("a/b/c.md", "../atas.excalidraw")).toEqual({
      kind: "drawing",
      path: "a/atas.excalidraw",
    });
  });

  it("classifies external links without intercepting them", () => {
    expect(resolveHref("a.md", "https://example.com")).toMatchObject({
      kind: "external",
    });
    expect(resolveHref("a.md", "#bagian")).toMatchObject({ kind: "external" });
  });

  it("rejects links that escape the workspace", () => {
    expect(resolveHref("a.md", "../luar.excalidraw")).toMatchObject({
      kind: "invalid",
    });
    expect(resolveHref("a.md", "file:///etc/passwd")).toMatchObject({
      kind: "invalid",
    });
    expect(resolveHref("a.md", "C:/x.excalidraw")).toMatchObject({ kind: "invalid" });
  });

  it("detects note links and unsupported targets", () => {
    expect(resolveHref("a.md", "lain.md")).toEqual({ kind: "note", path: "lain.md" });
    expect(resolveHref("a.md", "gambar.png")).toMatchObject({ kind: "invalid" });
  });

  it("derives a readable link label", () => {
    expect(drawingLinkText("arsitektur/New 1.excalidraw")).toBe("New 1");
  });
});
