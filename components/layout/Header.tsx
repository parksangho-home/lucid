"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navigation } from "@/data/navigation";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
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
        </nav>
        <span className="header-coordinate">
          PERSONAL UNIVERSE <span className="live-dot" />
        </span>
      </div>
    </header>
  );
}
