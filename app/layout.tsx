import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { SpaceBackground } from "@/components/space/SpaceBackground";
import "./globals.css";
import { dashboardMode } from "@/lib/dashboard/routing";

export const metadata: Metadata = {
  title: { default: "LUCID SPACE", template: "%s | LUCID SPACE" },
  description:
    "AI와 기술을 배우고 직접 만들며 새로운 가능성을 탐험하는 개인 디지털 공간",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">
          본문으로 건너뛰기
        </a>
        <SpaceBackground />
        <Header dashboardInternal={dashboardMode() === "internal"} />
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
