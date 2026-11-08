import { describe, expect, it } from "vitest";
import { SearchIndex } from "../services/searchIndex";

function createIndex(): SearchIndex {
  const index = new SearchIndex();
  index.upsertNote("new/New 1.md", "Pembayaran via transfer bank.");
  index.upsertNote("new/New 2.md", "Catatan arsitektur tanpa kata kunci itu.");
  index.upsertNote("new/New 10.md", "Pembayaran kedua di file kesepuluh.");
  index.upsertName("gambar/pembayaran.excalidraw", "drawing");
  index.upsertName("gambar/lain.excalidraw", "drawing");
  return index;
}

describe("SearchIndex", () => {
  it("separates name hits from content hits", () => {
    const results = createIndex().search("pembayaran");
    expect(results.names.map((item) => item.name)).toEqual(["pembayaran.excalidraw"]);
    expect(results.contents.map((item) => item.name)).toEqual(["New 1.md", "New 10.md"]);
  });

  it("never searches drawing content", () => {
    const index = new SearchIndex();
    index.upsertName("gambar/foo.excalidraw", "drawing");
    const results = index.search("foo");
    expect(results.names).toHaveLength(1);
    expect(results.contents).toHaveLength(0);
    expect(index.search("apa pun").contents).toHaveLength(0);
  });

  it("includes a snippet for content hits", () => {
    const results = createIndex().search("transfer");
    expect(results.contents[0]?.snippet).toContain("Pembayaran via transfer bank.");
  });

  it("sorts numerically by name", () => {
    const results = createIndex().search("New");
    expect(results.names.map((item) => item.name)).toEqual(["New 1.md", "New 2.md", "New 10.md"]);
  });

  it("keeps entries in sync on rename and delete", () => {
    const index = createIndex();
    index.rename("new/New 1.md", "new/baru.md");
    expect(index.search("baru").names[0]?.name).toBe("baru.md");
    index.removePrefix("new");
    expect(index.search("New 2").names).toHaveLength(0);
  });
});
