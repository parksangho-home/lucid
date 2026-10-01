import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProjectGrid } from "@/components/projects/ProjectGrid";

export function ProjectsSection() {
  return (
    <section id="projects" className="section container">
      <div className="section-top">
        <SectionTitle label="02 / EXPLORATION" title="PROJECTS">
          Ideas become experiments. Experiments become projects.
        </SectionTitle>
        <Link href="/projects" className="text-link">
          ALL PROJECTS ↗
        </Link>
      </div>
      <ProjectGrid />
    </section>
  );
}
