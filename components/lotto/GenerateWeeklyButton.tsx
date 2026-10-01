"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function GenerateWeeklyButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function generate() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/lotto/picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "추천을 저장하지 못했습니다.");
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "추천을 저장하지 못했습니다.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <button
        type="button"
        className="button primary"
        disabled={busy}
        onClick={generate}
      >
        {busy ? "생성·저장 중…" : "이번 회차 5게임 생성"}
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
