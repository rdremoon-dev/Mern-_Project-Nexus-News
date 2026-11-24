import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

const TiptapEditor = ({ value, onChange, onRequestImageInsert }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [editor, value]);

  const insertImage = async () => {
    const url = await onRequestImageInsert();
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  };

  const setLink = () => {
    if (!editor) return;
    const href = window.prompt('Enter a URL');
    if (href) editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };

  const buttonClass =
    'border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 disabled:opacity-50';

  return (
    <div className="border border-gray-300">
      <div className="flex flex-wrap gap-2 border-b border-gray-300 p-2">
        <button
          type="button"
          className={buttonClass}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          Bold
        </button>
        <button
          type="button"
          className={buttonClass}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>
        <button
          type="button"
          className={buttonClass}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          Heading
        </button>
        <button
          type="button"
          className={buttonClass}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          Bullet list
        </button>
        <button
          type="button"
          className={buttonClass}
          disabled={!editor}
          onClick={setLink}
        >
          Link
        </button>
        <button
          type="button"
          className={buttonClass}
          disabled={!editor}
          onClick={insertImage}
        >
          + ImageKit Img
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="min-h-48 p-3 [&_p]:mb-4 [&_p:last-child]:mb-0"
      />
    </div>
  );
};

export default TiptapEditor;
