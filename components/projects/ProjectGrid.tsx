import Link from "next/link";
import { projects } from "@/data/projects";
import { Planet } from "@/components/space/Planet";
import { ProjectStatus } from "./ProjectStatus";

export function ProjectGrid() {
  return (
    <div className="project-grid">
      {projects.map((project, index) => (
        <article className={`project-card ${project.theme}`} key={project.id}>
          <div className="card-top">
            <span className="mono">
              PLANET {String(index + 1).padStart(2, "0")}
            </span>
            <ProjectStatus status={project.status} />
          </div>
          <Planet theme={project.theme} />
          <p className="project-category">{project.category}</p>
          <h3>{project.name}</h3>
          <p className="project-description">{project.description}</p>
          {project.href ? (
            <Link className="card-link" href={project.href}>
              <span>프로젝트 탐험하기</span>
              <span aria-hidden="true">↗</span>
            </Link>
          ) : (
            <p className="card-link muted">
              새로운 궤도를 준비하고 있습니다 <span aria-hidden="true">＋</span>
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
