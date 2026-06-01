"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { IMPORTANT_LINK_LIMIT, IMPORTANT_LINK_SELECT } from "@/lib/db-selects";
import { createClient } from "@/lib/supabase/client";
import { normalizeUrl } from "@/lib/utils";
import type { ImportantLink, ImportantLinkInput } from "@/types/link";

export function useImportantLinks(user: User | null, initialLinks?: ImportantLink[]) {
  const supabase = useMemo(() => createClient(), []);
  const userId = user?.id ?? null;
  const initialLinksHandled = useRef(initialLinks !== undefined);
  const [links, setLinks] = useState<ImportantLink[]>(() => initialLinks ?? []);
  const [loading, setLoading] = useState(initialLinks === undefined);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    if (!userId) {
      setLinks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("important_links")
      .select(IMPORTANT_LINK_SELECT)
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(IMPORTANT_LINK_LIMIT);

    if (fetchError) {
      setError("링크를 불러오지 못했습니다.");
      setLoading(false);
      return;
    }

    setLinks(data ?? []);
    setLoading(false);
  }, [supabase, userId]);

  useEffect(() => {
    if (initialLinksHandled.current) {
      initialLinksHandled.current = false;
      setLoading(false);
      return;
    }

    fetchLinks();
  }, [fetchLinks]);

  async function createLink(input: ImportantLinkInput) {
    if (!userId) {
      throw new Error("로그인이 필요합니다.");
    }

    const { data, error: insertError } = await supabase
      .from("important_links")
      .insert({
        user_id: userId,
        title: input.title.trim(),
        url: normalizeUrl(input.url)
      })
      .select(IMPORTANT_LINK_SELECT)
      .single();

    if (insertError || !data) {
      throw new Error("링크를 저장하지 못했습니다.");
    }

    setLinks((current) => [...current, data]);
  }

  async function deleteLink(id: string) {
    const { error: deleteError } = await supabase.from("important_links").delete().eq("id", id);

    if (deleteError) {
      throw new Error("링크를 삭제하지 못했습니다.");
    }

    setLinks((current) => current.filter((link) => link.id !== id));
  }

  return {
    createLink,
    deleteLink,
    error,
    links,
    loading
  };
}
