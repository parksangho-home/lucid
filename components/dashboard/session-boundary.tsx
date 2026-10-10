"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client.ts";
const OwnerContext = createContext("");
export function useDashboardUser() {return useContext(OwnerContext);}
export function DashboardSession({userId, children}: {userId: string; children: React.ReactNode}) {
  const router = useRouter();
  const [valid, setValid] = useState(true);
  useEffect(() => {
    let active = true;
    let revision = 0;
    const clear = () => { if (active) {setValid(false); router.replace("/"); router.refresh();} };
    const verify = async () => {
      const current = ++revision;
      try {
        const r = await fetch("/api/dashboard-access", {cache: "no-store"});
        const data = await r.json();
        if (active && revision === current && (!r.ok || data.authorized !== true || data.userId !== userId)) clear();
      } catch {if (active && revision === current) clear();}
    };
    const {data: {subscription}} = createClient().auth.onAuthStateChange((_event, session) => {
      if (!session || session.user.id !== userId) {revision++; clear();}
      else void verify();
    });
    void verify();
    window.addEventListener("focus", verify); window.addEventListener("dashboard-session-invalid", clear);
    return () => {active = false; revision++; subscription.unsubscribe(); window.removeEventListener("focus", verify); window.removeEventListener("dashboard-session-invalid", clear);};
  }, [router, userId]);
  return valid ? <OwnerContext.Provider value={userId}>{children}</OwnerContext.Provider> : null;
}
