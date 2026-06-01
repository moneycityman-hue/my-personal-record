import { redirect } from "next/navigation";
import { IMPORTANT_LINK_LIMIT, IMPORTANT_LINK_SELECT, NOTE_SELECT } from "@/lib/db-selects";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { DashboardView } from "@/components/dashboard/DashboardView";
import type { ImportantLink } from "@/types/link";
import type { Note } from "@/types/note";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [notesResult, linksResult] = await Promise.all([
    supabase
      .from("notes")
      .select(NOTE_SELECT)
      .eq("user_id", user.id)
      .eq("is_completed", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("important_links")
      .select(IMPORTANT_LINK_SELECT)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(IMPORTANT_LINK_LIMIT)
  ]);

  const initialDataError =
    notesResult.error || linksResult.error ? "일부 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." : null;

  return (
    <DashboardView
      initialDataError={initialDataError}
      initialLinks={linksResult.error ? undefined : ((linksResult.data ?? []) as ImportantLink[])}
      initialNotes={notesResult.error ? undefined : ((notesResult.data ?? []) as Note[])}
      initialUser={user}
    />
  );
}
