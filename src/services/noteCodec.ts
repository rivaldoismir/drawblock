import type {
  BlockNoteEditor,
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema,
  PartialBlock,
} from "@blocknote/core";

type DefaultEditor = BlockNoteEditor<
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema
>;

type DefaultPartialBlock = PartialBlock<
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema
>;

/**
 * Satu-satunya pintu konversi Markdown <-> blok BlockNote.
 * Jangan memanggil parser/serializer BlockNote dari komponen lain.
 */
export function parseMarkdown(
  editor: DefaultEditor,
  markdown: string,
): DefaultPartialBlock[] {
  try {
    const blocks = editor.tryParseMarkdownToBlocks(markdown);
    return blocks.length > 0 ? blocks : [{ type: "paragraph" }];
  } catch (error) {
    console.error("Gagal mem-parse Markdown, menampilkan sebagai paragraf.", error);
    return [{ type: "paragraph", content: markdown }];
  }
}

export function serializeMarkdown(
  editor: DefaultEditor,
  blocks = editor.document,
): string {
  return editor.blocksToMarkdownLossy(blocks);
}
