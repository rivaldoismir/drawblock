import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { BlockNoteView } from "@blocknote/mantine";
import {
  AddBlockButton,
  BasicTextStyleButton,
  BlockTypeSelect,
  CreateLinkButton,
  DragHandleButton,
  FormattingToolbar,
  FormattingToolbarController,
  RemoveBlockItem,
  SideMenu,
  SideMenuController,
  SuggestionMenuController,
  blockTypeSelectItems,
  getDefaultReactSlashMenuItems,
  useBlockNoteEditor,
  useCreateBlockNote,
} from "@blocknote/react";
import type { DefaultReactSuggestionItem, SideMenuProps } from "@blocknote/react";
import { DrawingPickerDialog } from "../components/Dialogs";
import { DrawingIcon } from "../components/icons";
import { parseMarkdown, serializeMarkdown } from "../services/noteCodec";
import { drawingHref, drawingLinkText, resolveHref } from "../services/linkTarget";

export interface EditorHandle {
  getMarkdown(): string;
  focus(): void;
}

interface DrawingOption {
  path: string;
  name: string;
  folder: string;
}

interface NoteEditorProps {
  notePath: string;
  markdown: string;
  theme: "light" | "dark";
  drawings: DrawingOption[];
  onChange: (markdown: string) => void;
  onReady: (normalizedMarkdown: string) => void;
  onOpenLink: (href: string) => void;
}

const ALLOWED_SLASH_TITLES = new Set([
  "Paragraph",
  "Heading 1",
  "Heading 2",
  "Heading 3",
  "Bullet List",
  "Numbered List",
  "Check List",
  "Quote",
  "Code Block",
  "Divider",
  "Table",
]);

const ALLOWED_SELECT_TYPES = new Set([
  "paragraph",
  "quote",
  "bulletListItem",
  "numberedListItem",
  "checkListItem",
]);

function filterSlashItems(
  items: DefaultReactSuggestionItem[],
  query: string,
): DefaultReactSuggestionItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return items;
  }
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(needle) ||
      item.aliases?.some((alias) => alias.toLowerCase().includes(needle)),
  );
}

function SafeFormattingToolbar() {
  const editor = useBlockNoteEditor();
  const items = blockTypeSelectItems(editor).filter((item) => {
    if (item.type === "heading") {
      const level = Number(item.props?.level ?? 0);
      return level >= 1 && level <= 3;
    }
    return ALLOWED_SELECT_TYPES.has(item.type);
  });

  return (
    <FormattingToolbar>
      <BlockTypeSelect items={items} />
      <BasicTextStyleButton basicTextStyle="bold" />
      <BasicTextStyleButton basicTextStyle="italic" />
      <BasicTextStyleButton basicTextStyle="strike" />
      <BasicTextStyleButton basicTextStyle="code" />
      <CreateLinkButton />
    </FormattingToolbar>
  );
}

function SafeSideMenu(props: SideMenuProps) {
  return (
    <SideMenu {...props}>
      <AddBlockButton />
      <DragHandleButton {...props}>
        <RemoveBlockItem>Hapus blok</RemoveBlockItem>
      </DragHandleButton>
    </SideMenu>
  );
}

export const NoteEditor = forwardRef<EditorHandle, NoteEditorProps>(function NoteEditor(
  { notePath, markdown, theme, drawings, onChange, onReady, onOpenLink },
  ref,
) {
  const editor = useCreateBlockNote({
    animations: true,
    trailingBlock: true,
    tables: {
      splitCells: true,
      cellBackgroundColor: false,
      cellTextColor: false,
      headers: true,
    },
  });
  const loading = useRef(true);
  const [pickerOpen, setPickerOpen] = useState(false);

  useLayoutEffect(() => {
    loading.current = true;
    editor.replaceBlocks(editor.document, parseMarkdown(editor, markdown));
    loading.current = false;
    onReady(serializeMarkdown(editor));
    // Hanya saat mount: NoteEditor di-remount per file lewat key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      getMarkdown: () => serializeMarkdown(editor),
      focus: () => editor.focus(),
    }),
    [editor],
  );

  const insertDrawingLink = (path: string) => {
    editor.createLink(drawingHref(notePath, path), drawingLinkText(path));
    setPickerOpen(false);
    editor.focus();
  };

  return (
    <div
      className="editor-pane note-pane"
      onClickCapture={(event) => {
        const anchor = (event.target as HTMLElement | null)?.closest("a");
        if (!anchor) {
          return;
        }
        const href = anchor.getAttribute("href");
        if (!href) {
          return;
        }
        const target = resolveHref(notePath, href);
        if (target.kind === "external") {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        onOpenLink(href);
      }}
    >
      <BlockNoteView
        editor={editor}
        theme={theme}
        onChange={() => {
          if (!loading.current) {
            onChange(serializeMarkdown(editor));
          }
        }}
        formattingToolbar={false}
        slashMenu={false}
        sideMenu={false}
        filePanel={false}
        emojiPicker={false}
      >
        <FormattingToolbarController formattingToolbar={SafeFormattingToolbar} />
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={(query) => {
            const defaultItems = getDefaultReactSlashMenuItems(editor).filter((item) =>
              ALLOWED_SLASH_TITLES.has(item.title),
            );
            const drawingItem: DefaultReactSuggestionItem = {
              title: "Tautan ke gambar",
              subtext: "Sisipkan tautan ke file .excalidraw",
              aliases: ["gambar", "excalidraw", "tautan", "link"],
              group: "DrawBlock",
              icon: <DrawingIcon size={18} />,
              onItemClick: () => setPickerOpen(true),
            };
            return Promise.resolve(
              filterSlashItems([...defaultItems, drawingItem], query),
            );
          }}
        />
        <SideMenuController sideMenu={SafeSideMenu} />
      </BlockNoteView>
      {pickerOpen ? (
        <DrawingPickerDialog
          drawings={drawings}
          onSelect={insertDrawingLink}
          onCancel={() => setPickerOpen(false)}
        />
      ) : null}
    </div>
  );
});
