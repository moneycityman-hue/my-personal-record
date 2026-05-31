"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { ImportantLinkChip } from "./ImportantLinkChip";
import { ImportantLinkEditor } from "./ImportantLinkEditor";
import { Button } from "@/components/ui/Button";
import type { ImportantLink } from "@/types/link";

type ImportantLinkBarProps = {
  error: string | null;
  links: ImportantLink[];
  onCreateLink: (input: { title: string; url: string }) => Promise<void>;
  onDeleteLink: (id: string) => Promise<void>;
};

export function ImportantLinkBar({ error, links, onCreateLink, onDeleteLink }: ImportantLinkBarProps) {
  const [open, setOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setActionError(null);

    try {
      await onDeleteLink(id);
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : "링크를 삭제하지 못했습니다.");
    }
  }

  return (
    <>
      <div className="link-bar" aria-label="중요 링크">
        {links.map((link) => (
          <ImportantLinkChip key={link.id} link={link} onDelete={handleDelete} />
        ))}
        <Button aria-label="중요 링크 추가" iconOnly onClick={() => setOpen(true)}>
          <Plus size={17} />
        </Button>
        {error || actionError ? <p className="status-message">{error ?? actionError}</p> : null}
      </div>
      {open ? <ImportantLinkEditor onClose={() => setOpen(false)} onSave={onCreateLink} /> : null}
    </>
  );
}
