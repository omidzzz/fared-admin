"use client";

import { useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignRight,
  AlignCenter,
  AlignLeft,
  LinkIcon,
  ImageIcon,
} from "lucide-react";
import { uploadFile } from "@/lib/api/upload";
import { Toast } from "@/components/ui/Toast";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "متن خود را وارد کنید...",
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "right",
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3 text-right",
        dir: "rtl",
      },
    },
  });

  // Sync external value changes
  const isInternalChange = useRef(false);
  if (editor && value !== editor.getHTML() && !isInternalChange.current) {
    editor.commands.setContent(value);
  }

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      if (!file.type.startsWith("image/")) {
        Toast.error("فقط فایل‌های تصویری مجاز هستند");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        Toast.error("حجم فایل نباید بیشتر از ۵ مگابایت باشد");
        return;
      }

      try {
        const result = await uploadFile("/api/media/upload", file);
        editor.chain().focus().setImage({ src: result.url }).run();
        Toast.success("تصویر با موفقیت آپلود شد");
      } catch {
        Toast.error("آپلود تصویر ناموفق بود");
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [editor]
  );

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("آدرس لینک:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        isActive
          ? "bg-brand/20 text-brand"
          : "text-[var(--text-secondary)] hover:bg-subtle hover:text-[var(--text-primary)]"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-[var(--border-default)] rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-[var(--border-default)] bg-subtle">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="ضخیم"
        >
          <Bold size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="کج"
        >
          <Italic size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="زیرخط"
        >
          <UnderlineIcon size={16} />
        </ToolbarButton>

        <div className="w-px h-5 bg-[var(--border-default)] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="تیتر ۲"
        >
          <Heading2 size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="تیتر ۳"
        >
          <Heading3 size={16} />
        </ToolbarButton>

        <div className="w-px h-5 bg-[var(--border-default)] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="لیست"
        >
          <List size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="لیست شمارشی"
        >
          <ListOrdered size={16} />
        </ToolbarButton>

        <div className="w-px h-5 bg-[var(--border-default)] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="راست‌چین"
        >
          <AlignRight size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="وسط‌چین"
        >
          <AlignCenter size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="چپ‌چین"
        >
          <AlignLeft size={16} />
        </ToolbarButton>

        <div className="w-px h-5 bg-[var(--border-default)] mx-1" />

        <ToolbarButton onClick={addLink} isActive={editor.isActive("link")} title="لینک">
          <LinkIcon size={16} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          title="تصویر"
        >
          <ImageIcon size={16} />
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}
