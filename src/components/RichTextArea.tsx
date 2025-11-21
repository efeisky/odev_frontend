'use client';

import { useMemo } from 'react';
import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import TextStyle from '@tiptap/extension-text';

import './editorStyles.css';

interface MenuBarProps {
  editor: ReturnType<typeof useEditor>;
}

function MenuBar({ editor }: MenuBarProps) {
  const state = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive('bold'),
      isItalic: ctx.editor.isActive('italic'),
      isCode: ctx.editor.isActive('codeBlock'),
      isHeading1: ctx.editor.isActive('heading', { level: 1 }),
      isHeading2: ctx.editor.isActive('heading', { level: 2 }),
      isHeading3: ctx.editor.isActive('heading', { level: 3 }),
      isParagraph: ctx.editor.isActive('paragraph'),
    }),
  });

  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 mb-2">
      {/* Bold */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-3 py-2 border border-gray-300 cursor-pointer rounded ${
          state.isBold ? 'bg-gray-200' : 'bg-white'
        }`}
      >
        <b>B</b>
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-3 py-2 border border-gray-300 cursor-pointer rounded ${
          state.isItalic ? 'bg-gray-200' : 'bg-white'
        }`}
      >
        <i>I</i>
      </button>

      {/* Code */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`px-3 py-2 border border-gray-300 cursor-pointer rounded ${
          state.isCode ? 'bg-gray-200' : 'bg-white'
        }`}
      >
        <pre>c</pre>
      </button>

      {/* Paragraph */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`px-3 py-2 border border-gray-300 cursor-pointer rounded ${
          state.isParagraph ? 'bg-gray-200' : 'bg-white'
        }`}
      >
        Paragraph
      </button>

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-2 border border-gray-300 cursor-pointer rounded ${
          state.isHeading1 ? 'bg-gray-200' : 'bg-white'
        }`}
      >
        Big Title
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-2 border border-gray-300 cursor-pointer rounded ${
          state.isHeading2 ? 'bg-gray-200' : 'bg-white'
        }`}
      >
        Title
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-3 py-2 border border-gray-300 cursor-pointer rounded ${
          state.isHeading3 ? 'bg-gray-200' : 'bg-white'
        }`}
      >
        Subtitle
      </button>
    </div>
  );
}

interface MyEditorProps {
  mode: 'edit' | 'view';
  value?: string;
  onChange?: (html: string) => void;
}

export default function TextAreaRich({ mode, value = '', onChange  }: MyEditorProps) {
  const editor = useEditor({
    extensions: useMemo(
      () => [
        TextStyle,
        StarterKit.configure({
          heading: false,
        }),
        Heading.configure({
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'TipTap-heading',
          },
        }),
      ],
      []
    ),
    content: value,
    onUpdate: ({editor}) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: 'TipTap',
      },
      editable: () => mode === 'edit',
      handleKeyDown(_, event) {
        if (event.ctrlKey && event.key.toLowerCase() === 'b') {
          editor?.chain().focus().toggleBold().run();
          event.preventDefault();
          return true;
        }
        if (event.ctrlKey && event.key.toLowerCase() === 'i') {
          editor?.chain().focus().toggleItalic().run();
          event.preventDefault();
          return true;
        }
        if (event.ctrlKey && event.key.toLowerCase() === 'k') {
          editor?.chain().focus().toggleCodeBlock().run();
          event.preventDefault();
          return true;
        }
        return false;
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="w-full">
      {mode === 'edit' && <MenuBar editor={editor} />}
      <EditorContent
        editor={editor}
        className="w-full py-4 rounded-lg focus:outline-none"
      />
    </div>
  );
}
