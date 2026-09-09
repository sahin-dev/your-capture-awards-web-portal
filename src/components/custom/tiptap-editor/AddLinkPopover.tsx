'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Toggle } from '@/components/ui/toggle';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Link2Off } from 'lucide-react';

interface Props {
  editor?: Editor | null;
  className?: string;
}

export const AddLinkPopover: React.FC<Props> = ({ editor, className }) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!open || !editor) return;
    const attrs = editor.getAttributes('link') as { href?: string };
    setUrl(attrs?.href ?? '');
  }, [open, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    if (!url) {
      editor.chain().focus().unsetLink().run();
      setOpen(false);
      return;
    }
    editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
    setOpen(false);
  }, [editor, url]);

  const unsetLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setOpen(false);
  }, [editor]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Toggle
          size="sm"
          pressed={!!editor?.isActive('link')}
          className={`text-muted-foreground hover:bg-surface-secondary data-[state=on]:bg-surface-secondary ${className ?? ''}`}
          title="Add/Edit link"
        >
          <LinkIcon className="h-4 w-4" />
        </Toggle>
      </PopoverTrigger>

      {/* FIX: Changed layout to stacked elements (single column) using space-y-2 */}
      <PopoverContent
        className="border-border bg-surface flex w-96 items-center gap-2 p-3"
        align="start"
      >
        <Input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setLink()}
        />
        {/* The button group still uses flex gap for horizontal arrangement */}
        <div className="flex gap-2">
          <Button
            onClick={setLink}
            className="bg-success text-success-foreground hover:bg-success/90"
          >
            {editor?.isActive('link') ? 'Update' : 'Add'}
          </Button>
          {editor?.isActive('link') && (
            <Button
              onClick={unsetLink}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 p-2"
            >
              <Link2Off className="size-4" />
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AddLinkPopover;
