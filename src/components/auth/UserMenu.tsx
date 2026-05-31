"use client";

import type { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

type UserMenuProps = {
  user: User | null;
  onSignOut: () => void;
};

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const name =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email ??
    "User";
  const image = user?.user_metadata?.avatar_url as string | undefined;
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <div className="user-menu">
      <div className="avatar" aria-hidden="true">
        {image ? (
          // OAuth avatars come from provider-specific hosts, so a plain image keeps setup friction low.
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" src={image} />
        ) : (
          initial
        )}
      </div>
      <div className="user-text">
        <p className="user-name">{name}</p>
        {user?.email ? <p className="user-email">{user.email}</p> : null}
      </div>
      <Button aria-label="로그아웃" iconOnly onClick={onSignOut}>
        <LogOut size={17} />
      </Button>
    </div>
  );
}
