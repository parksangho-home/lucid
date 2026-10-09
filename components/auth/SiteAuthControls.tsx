"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { loginReturnCookie } from "@/lib/supabase/login-return";

type HeaderUser = {
  name?: string;
};

export function SiteAuthControls() {
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getUser().then(({ data }) => {
      const authUser = data.user;
      setUser(
        authUser
          ? {
              name:
                authUser.user_metadata?.full_name ||
                authUser.user_metadata?.name ||
                authUser.email ||
                "USER",
            }
          : null,
      );
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user;
      setUser(
        authUser
          ? {
              name:
                authUser.user_metadata?.full_name ||
                authUser.user_metadata?.name ||
                authUser.email ||
                "USER",
            }
          : null,
      );
      setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn() {
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      document.cookie = loginReturnCookie(window.location.pathname, window.location.protocol === "https:");
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signInError) throw signInError;
    } catch {
      setError("로그인에 실패했습니다.");
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      window.location.reload();
    } catch {
      setError("로그아웃에 실패했습니다.");
      setBusy(false);
    }
  }

  if (!ready) {
    return <span className="header-auth-status">AUTH ···</span>;
  }

  return (
    <div className="header-auth">
      {user ? (
        <button type="button" disabled={busy} onClick={signOut} title="로그아웃">
          <span className="header-auth-user">{user.name}</span>
          <span className="header-auth-action">LOGOUT</span>
        </button>
      ) : (
        <button type="button" disabled={busy} onClick={signIn}>
          GOOGLE LOGIN
        </button>
      )}
      {error && (
        <span className="header-auth-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
