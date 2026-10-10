"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { navigation } from "@/data/navigation";
import { SiteAuthControls } from "@/components/auth/SiteAuthControls";

export function Header({dashboardInternal = false}: {dashboardInternal?: boolean}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isDashboardOwner, setIsDashboardOwner] = useState(false);
  useEffect(() => {
    const supabase = createClient();
    let active = true;
    let revision = 0;
    const check = async () => {
      const current = ++revision;
      setIsDashboardOwner(false);
      try {
        const response = await fetch("/api/dashboard-access", { cache: "no-store" });
        const result = await response.json();
        if (active && current === revision) setIsDashboardOwner(response.ok && result.authorized === true);
      } catch { if (active && current === revision) setIsDashboardOwner(false); }
    };
    void check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { void check(); });
    window.addEventListener("focus", check);
    return () => { active = false; revision++; subscription.unsubscribe(); window.removeEventListener("focus", check); };
  }, []);

  return (
    <header className="header">
      <div className="container header-inner">
        <Link
          href="/"
          className="brand"
          aria-label="LUCID SPACE 홈"
          onClick={() => setOpen(false)}
        >
          <span className="brand-orbit" aria-hidden="true" />
          LUCID<span className="brand-light">SPACE</span>
        </Link>
        <button
          className="menu-toggle"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? "닫기 ×" : "메뉴 ☰"}
        </button>
        <nav
          id="navigation"
          aria-label="주 메뉴"
          className={open ? "navigation is-open" : "navigation"}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              document
                .querySelector<HTMLButtonElement>(".menu-toggle")
                ?.focus();
            }
          }}
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={
                (
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href)
                )
                  ? "page"
                  : undefined
              }
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {isDashboardOwner && (dashboardInternal ? (
            <Link href="/dashboard" aria-current={pathname.startsWith("/dashboard") ? "page" : undefined} onClick={() => setOpen(false)}>
              DASHBOARD
            </Link>
          ) : (
            // The legacy zone is a different Next.js app and requires a full navigation.
            // eslint-disable-next-line @next/next/no-html-link-for-pages
            <a href="/dashboard" onClick={() => setOpen(false)}>DASHBOARD</a>
          ))}
        </nav>
        <SiteAuthControls />
      </div>
    </header>
  );
}
