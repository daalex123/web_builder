"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, useState } from "react";
import type { ContentDoc } from "@cms/shared/schemas";
import { Button, Card, Divider, Form, Input, Modal, Space, Tooltip } from "antd";
import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BoldOutlined,
  CodeOutlined,
  ItalicOutlined,
  LinkOutlined,
  OrderedListOutlined,
  PictureOutlined,
  RedoOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { MediaPicker } from "@/components/media-library";
import type { MediaItem } from "@/components/media-library";

export function TipTapEditor({
  content,
  onChange,
}: {
  content: ContentDoc;
  onChange: (content: ContentDoc) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Link.configure({ openOnClick: false }),
      Image.configure({ HTMLAttributes: { style: "max-width: 100%; border-radius: 6px" } }),
      Placeholder.configure({ placeholder: "Start writing your page content..." }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getJSON() as ContentDoc);
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },
  });

  useEffect(() => {
    if (editor && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  function insertImage(item: MediaItem) {
    editor?.chain().focus().setImage({ src: item.url, alt: item.alt ?? item.filename }).run();
  }

  function setLink() {
    if (!linkUrl) {
      editor?.chain().focus().unsetLink().run();
    } else {
      editor?.chain().focus().setLink({ href: linkUrl }).run();
    }
    setLinkOpen(false);
    setLinkUrl("");
  }

  if (!editor) return null;

  const tb = (active: boolean) => ({
    type: active ? ("primary" as const) : ("default" as const),
    ghost: active,
  });

  return (
    <>
      <Card styles={{ body: { padding: 0 } }}>
        <div style={{ padding: 8, borderBottom: "1px solid #f0f0f0", background: "#fafafa", display: "flex", flexWrap: "wrap", gap: 4 }}>
          <Space size={4} wrap>
            <Tooltip title="Bold">
              <Button size="small" icon={<BoldOutlined />} {...tb(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()} />
            </Tooltip>
            <Tooltip title="Italic">
              <Button size="small" icon={<ItalicOutlined />} {...tb(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()} />
            </Tooltip>
            <Tooltip title="Underline">
              <Button size="small" icon={<UnderlineOutlined />} {...tb(editor.isActive("underline"))} onClick={() => editor.chain().focus().toggleUnderline().run()} />
            </Tooltip>
            <Tooltip title="Strikethrough">
              <Button size="small" icon={<StrikethroughOutlined />} {...tb(editor.isActive("strike"))} onClick={() => editor.chain().focus().toggleStrike().run()} />
            </Tooltip>
          </Space>
          <Divider type="vertical" style={{ height: 24, margin: "4px 0" }} />
          <Space size={4} wrap>
            <Button size="small" {...tb(editor.isActive("heading", { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</Button>
            <Button size="small" {...tb(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Button>
            <Button size="small" {...tb(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Button>
          </Space>
          <Divider type="vertical" style={{ height: 24, margin: "4px 0" }} />
          <Space size={4} wrap>
            <Tooltip title="Bullet list">
              <Button size="small" icon={<UnorderedListOutlined />} {...tb(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()} />
            </Tooltip>
            <Tooltip title="Ordered list">
              <Button size="small" icon={<OrderedListOutlined />} {...tb(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
            </Tooltip>
            <Button size="small" {...tb(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>Quote</Button>
            <Button size="small" onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</Button>
            <Tooltip title="Code block">
              <Button size="small" icon={<CodeOutlined />} {...tb(editor.isActive("codeBlock"))} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
            </Tooltip>
          </Space>
          <Divider type="vertical" style={{ height: 24, margin: "4px 0" }} />
          <Space size={4} wrap>
            <Tooltip title="Align left">
              <Button size="small" icon={<AlignLeftOutlined />} {...tb(editor.isActive({ textAlign: "left" }))} onClick={() => editor.chain().focus().setTextAlign("left").run()} />
            </Tooltip>
            <Tooltip title="Align center">
              <Button size="small" icon={<AlignCenterOutlined />} {...tb(editor.isActive({ textAlign: "center" }))} onClick={() => editor.chain().focus().setTextAlign("center").run()} />
            </Tooltip>
            <Tooltip title="Align right">
              <Button size="small" icon={<AlignRightOutlined />} {...tb(editor.isActive({ textAlign: "right" }))} onClick={() => editor.chain().focus().setTextAlign("right").run()} />
            </Tooltip>
          </Space>
          <Divider type="vertical" style={{ height: 24, margin: "4px 0" }} />
          <Space size={4} wrap>
            <Tooltip title="Insert link">
              <Button size="small" icon={<LinkOutlined />} {...tb(editor.isActive("link"))} onClick={() => setLinkOpen(true)} />
            </Tooltip>
            <Tooltip title="Insert image">
              <Button size="small" icon={<PictureOutlined />} onClick={() => setPickerOpen(true)} />
            </Tooltip>
          </Space>
          <Divider type="vertical" style={{ height: 24, margin: "4px 0" }} />
          <Space size={4} wrap>
            <Tooltip title="Undo">
              <Button size="small" icon={<UndoOutlined />} onClick={() => editor.chain().focus().undo().run()} />
            </Tooltip>
            <Tooltip title="Redo">
              <Button size="small" icon={<RedoOutlined />} onClick={() => editor.chain().focus().redo().run()} />
            </Tooltip>
          </Space>
        </div>
        <EditorContent editor={editor} />
      </Card>

      <Modal
        title="Insert link"
        open={linkOpen}
        onCancel={() => setLinkOpen(false)}
        onOk={setLink}
        okText="Apply"
      >
        <Form layout="vertical">
          <Form.Item label="URL">
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://"
              autoFocus
            />
          </Form.Item>
        </Form>
      </Modal>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={insertImage}
        filter="image"
      />
    </>
  );
}
