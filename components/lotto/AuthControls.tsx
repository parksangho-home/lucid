"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthControls({ name }: { name?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signIn() {
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/projects/lotto`,
        },
      });
      if (signInError) throw signInError;
    } catch {
      setError("로그인하지 못했습니다. 잠시 후 다시 시도해 주세요.");
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
      setError("로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setBusy(false);
    }
  }

  return (
    <div className="auth-controls">
      {name ? (
        <button
          className="button primary"
          type="button"
          disabled={busy}
          onClick={signOut}
        >
          {name} · 로그아웃
        </button>
      ) : (
        <div className="auth-actions">
          <button
            className="button primary"
            type="button"
            disabled={busy}
            onClick={signIn}
          >
            Google로 로그인
          </button>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
