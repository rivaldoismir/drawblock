import { describe, expect, it } from "vitest";
import {
  baseName,
  extensionOf,
  isDrawingFile,
  isHiddenName,
  isInsidePath,
  isNoteFile,
  joinPath,
  nextCopyName,
  parentPath,
  validateEntryName,
  withExtension,
} from "../lib/path";

describe("path", () => {
  it("joins and splits relative paths", () => {
    expect(joinPath("a", "b", "c.md")).toBe("a/b/c.md");
    expect(joinPath("", "c.md")).toBe("c.md");
    expect(parentPath("a/b/c.md")).toBe("a/b");
    expect(parentPath("c.md")).toBe("");
    expect(baseName("a/b/c.md")).toBe("c.md");
  });

  it("detects extensions and kinds", () => {
    expect(extensionOf("New 1.excalidraw")).toBe(".excalidraw");
    expect(extensionOf("README")).toBe("");
    expect(isNoteFile("A.MD")).toBe(true);
    expect(isNoteFile("A.excalidraw")).toBe(false);
    expect(isDrawingFile("A.Excalidraw")).toBe(true);
    expect(isHiddenName(".git")).toBe(true);
    expect(isHiddenName("node_modules")).toBe(true);
    expect(isHiddenName("catatan.md")).toBe(false);
  });

  it("checks containment", () => {
    expect(isInsidePath("a/b", "")).toBe(true);
    expect(isInsidePath("a/b", "a")).toBe(true);
    expect(isInsidePath("ab", "a")).toBe(false);
  });

  it("validates names", () => {
    expect(validateEntryName("catatan")).toBeNull();
    expect(validateEntryName("")).not.toBeNull();
    expect(validateEntryName("a/b")).not.toBeNull();
    expect(validateEntryName("..")).not.toBeNull();
    expect(validateEntryName("nama.")).not.toBeNull();
  });

  it("keeps the target extension when renaming", () => {
    expect(withExtension("catatan", ".md")).toBe("catatan.md");
    expect(withExtension("catatan.md", ".md")).toBe("catatan.md");
    expect(withExtension("gambar.excalidraw", ".md")).toBe("gambar.md");
    expect(withExtension("gambar", ".excalidraw")).toBe("gambar.excalidraw");
  });

  it("generates unique copy names", () => {
    expect(nextCopyName(["catatan.md"], "catatan.md")).toBe("catatan (2).md");
    expect(nextCopyName(["catatan.md", "catatan (2).md"], "catatan.md")).toBe(
      "catatan (3).md",
    );
    expect(nextCopyName([], "gambar.excalidraw")).toBe("gambar (2).excalidraw");
  });
});
