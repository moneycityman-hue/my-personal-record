"use client";

import { LogIn } from "lucide-react";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

type LoginButtonProps = {
  disabled?: boolean;
};

export function LoginButton({ disabled = false }: LoginButtonProps) {
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!supabase) {
      setError("Supabase 환경변수를 먼저 설정해 주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (signInError) {
      setError("로그인하지 못했습니다. 다시 시도해 주세요.");
      setLoading(false);
    }
  }

  return (
    <div className="form-grid">
      <Button aria-label="Google 계정으로 로그인" disabled={disabled || loading} onClick={handleLogin} variant="primary">
        <LogIn size={18} />
        {loading ? "연결 중" : "Google로 로그인"}
      </Button>
      {error ? <p className="status-message">{error}</p> : null}
    </div>
  );
}
