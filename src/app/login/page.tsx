import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { LoginButton } from "@/components/auth/LoginButton";

export default async function LoginPage() {
  const configured = hasSupabaseEnv();

  if (configured) {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <p className="eyebrow">Personal Memo Dashboard</p>
        <h1 id="login-title">개인 메모 공간</h1>
        <p className="login-copy">Google 계정으로 로그인하고 메모, 할일, 중요한 링크를 한 곳에서 관리하세요.</p>
        <LoginButton disabled={!configured} />
        {!configured ? <p className="status-message">.env.local에 Supabase URL과 anon key를 설정해 주세요.</p> : null}
      </section>
    </main>
  );
}
