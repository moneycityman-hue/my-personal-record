"use client";

import type { User } from "@supabase/supabase-js";
import { Plus, Search } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";
import { Button } from "@/components/ui/Button";
import { ImportantLinkBar } from "@/components/links/ImportantLinkBar";
import type { ImportantLink } from "@/types/link";

type TopbarProps = {
  links: ImportantLink[];
  query: string;
  user: User | null;
  linkError: string | null;
  onCreateLink: (input: { title: string; url: string }) => Promise<void>;
  onDeleteLink: (id: string) => Promise<void>;
  onNewNote: () => void;
  onQueryChange: (value: string) => void;
  onSignOut: () => void;
};

export function Topbar({
  links,
  linkError,
  onCreateLink,
  onDeleteLink,
  onNewNote,
  onQueryChange,
  onSignOut,
  query,
  user
}: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-row primary">
        <ImportantLinkBar error={linkError} links={links} onCreateLink={onCreateLink} onDeleteLink={onDeleteLink} />
        <UserMenu onSignOut={onSignOut} user={user} />
      </div>
      <div className="topbar-row">
        <div className="search-wrap">
          <Search size={17} />
          <input
            aria-label="전체 메모 검색"
            className="search-input"
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="메모 검색"
            value={query}
          />
        </div>
        <Button aria-label="새 메모 만들기" onClick={onNewNote} variant="primary">
          <Plus size={17} />
          새 메모
        </Button>
      </div>
    </header>
  );
}
