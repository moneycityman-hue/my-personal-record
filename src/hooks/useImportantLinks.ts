"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { normalizeUrl } from "@/lib/utils";
import type { ImportantLink, ImportantLinkInput } from "@/types/link";

export function useImportantLinks(user: User | null) {
  const supabase = useMemo(() => createClient(), []);
  const userId = user?.id ?? null;
  const [links, setLinks] = useState<ImportantLink[]>([]);
  const [loading, setLoading] = useState(true);
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
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (fetchError) {
      setError("링크를 불러오지 못했습니다.");
      setLoading(false);
      return;
    }

    setLinks(data ?? []);
    setLoading(false);
  }, [supabase, userId]);

  useEffect(() => {
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
      .select("*")
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
