'use client';

import React, { useCallback, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Toggle } from '@/components/ui/toggle';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon } from 'lucide-react';

interface Props {
  editor?: Editor | null;
  className?: string;
}

export const AddImagePopover: React.FC<Props> = ({ editor, className }) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');

  // Add image by URL
  const addImageByUrl = useCallback(() => {
    if (!editor || !url) return;
    editor.chain().focus().setImage({ src: url }).run();
    setUrl('');
    setOpen(false);
  }, [editor, url]);

  // Add image from local file (base64)
  const addImageFromFile = useCallback(
    (file: File) => {
      if (!editor || !file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string | null;
        if (result) {
          editor.chain().focus().setImage({ src: result }).run();
          setOpen(false);
        }
      };
      reader.readAsDataURL(file);
    },
    [editor],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Toggle
          size="sm"
          pressed={false}
          className={`text-muted-foreground hover:bg-surface-secondary data-[state=on]:bg-surface-secondary ${className ?? ''}`}
          title="Insert image"
        >
          <ImageIcon className="h-4 w-4" />
        </Toggle>
      </PopoverTrigger>

      <PopoverContent className="bg-surface w-80 space-y-3 p-3" align="start">
        {/* URL input */}
        <div className="flex gap-2">
          <Input
            placeholder="Image URL (https://...)"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addImageByUrl()}
            className="border-border bg-surface-secondary text-foreground placeholder:text-placeholder-foreground"
          />
          <Button onClick={addImageByUrl} className="text-foreground">
            Add
          </Button>
        </div>

        {/* Local upload */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) addImageFromFile(f);
            if (fileRef.current) fileRef.current.value = '';
          }}
        />

        <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
          <ImageIcon className="mr-2 size-4" />
          Upload from computer
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default AddImagePopover;
