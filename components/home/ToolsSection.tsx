import Link from "next/link";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function ToolsSection() {
  return (
    <section className="section container">
      <div className="section-top">
        <SectionTitle label="04 / UTILITIES" title="SMALL TOOLS, BIG HELP.">
          일상의 작은 불편함을 해결하는 직접 만든 도구들.
        </SectionTitle>
        <Link href="/tools" className="text-link">
          ALL TOOLS ↗
        </Link>
      </div>
      <ToolGrid />
    </section>
  );
}
