"use client";
import { useCallback } from "react";
import { useDashboardUser } from "./session-boundary";
export function useNoteRequest() {
  const userId = useDashboardUser();
  return useCallback(async (path: string, init: RequestInit = {}) => {
    const response = await fetch(path, {...init, cache: "no-store", headers: {...Object.fromEntries(new Headers(init.headers)), "x-dashboard-user": userId}});
    if ([401, 403].includes(response.status)) window.dispatchEvent(new Event("dashboard-session-invalid"));
    if (response.status === 204) return {};
    const data = await response.json();
    if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "요청을 완료하지 못했습니다.");
    return data;
  }, [userId]);
}
