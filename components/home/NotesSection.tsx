import Link from "next/link";
import { NotesPlaceholder } from "@/components/notes/NotesPlaceholder";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function NotesSection() {
  return (
    <section className="section container">
      <div className="section-top">
        <SectionTitle label="05 / LOGBOOK" title="NOTES & DISCOVERIES" />
        <Link href="/notes" className="text-link">
          ALL NOTES ↗
        </Link>
      </div>
      <NotesPlaceholder />
    </section>
  );
}
