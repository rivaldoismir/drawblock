import { describe, expect, it } from "vitest";
import { nextAvailableName } from "../lib/path";

describe("nextAvailableName", () => {
  it("starts at New 1", () => {
    expect(nextAvailableName([], ".md")).toBe("New 1.md");
    expect(nextAvailableName([], ".excalidraw")).toBe("New 1.excalidraw");
  });

  it("uses the smallest unused number", () => {
    expect(nextAvailableName(["New 1.md"], ".md")).toBe("New 2.md");
    expect(nextAvailableName(["New 2.md"], ".md")).toBe("New 1.md");
    expect(nextAvailableName(["New 1.md", "New 3.md"], ".md")).toBe("New 2.md");
  });

  it("numbers each extension independently", () => {
    const existing = ["New 1.md", "New 2.md", "New 1.excalidraw"];
    expect(nextAvailableName(existing, ".md")).toBe("New 3.md");
    expect(nextAvailableName(existing, ".excalidraw")).toBe("New 2.excalidraw");
  });

  it("ignores unrelated names", () => {
    expect(nextAvailableName(["catatan.md", "New notes.md", "New 1.txt"], ".md")).toBe(
      "New 1.md",
    );
  });
});
