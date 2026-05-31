"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function useAuth(initialUser?: User) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [loading, setLoading] = useState(!initialUser);

  useEffect(() => {
    let mounted = true;

    if (!initialUser) {
      supabase.auth.getUser().then(({ data }) => {
        if (mounted) {
          setUser(data.user);
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser((currentUser) => {
        if (currentUser?.id === nextUser?.id && currentUser?.email === nextUser?.email) {
          return currentUser;
        }

        return nextUser;
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialUser, supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return {
    loading,
    signOut,
    supabase,
    user
  };
}
