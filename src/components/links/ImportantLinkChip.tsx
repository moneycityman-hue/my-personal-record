"use client";

import { ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ImportantLink } from "@/types/link";

type ImportantLinkChipProps = {
  link: ImportantLink;
  onDelete: (id: string) => Promise<void>;
};

export function ImportantLinkChip({ link, onDelete }: ImportantLinkChipProps) {
  return (
    <span className="link-chip">
      <a href={link.url} rel="noreferrer" target="_blank">
        {link.title}
      </a>
      <ExternalLink size={13} aria-hidden="true" />
      <Button aria-label={`${link.title} 링크 삭제`} className="chip-delete" iconOnly onClick={() => onDelete(link.id)}>
        <X size={14} />
      </Button>
    </span>
  );
}
