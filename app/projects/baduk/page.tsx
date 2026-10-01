import Link from "next/link";
import { projects } from "@/data/projects";
import { PageIntro } from "@/components/ui/PageIntro";
import { ProjectStatus } from "@/components/projects/ProjectStatus";
import { Planet } from "@/components/space/Planet";
export const metadata = { title: "BADUK LAB" };
export default function BadukPage() {
  const project = projects.find((project) => project.id === "baduk")!;
  return (
    <div className="container inner-page">
      <Link href="/projects" className="text-link">
        ← ALL PROJECTS
      </Link>
      <PageIntro
        label="PLANET 02 / GAME · LEARNING"
        title={project.name}
        description={project.description}
      />
      <div className="baduk-panel">
        <Planet theme="violet" />
        <div>
          <ProjectStatus status={project.status} />
          <h2>한 수의 배움, 무한한 가능성.</h2>
          <p className="body-copy">
            바둑을 직접 배우기 위해 만드는 개인 학습 및 게임 프로젝트입니다.
            현재는 다음 탐험을 준비하는 단계입니다.
          </p>
          <p className="body-copy">
            앞으로 바둑 게임과 학습, AI 대국, 기보 저장과 대국 분석을 독립적인
            프로젝트로 확장할 예정입니다.
          </p>
          <div className="tags">
            <span>GAME</span>
            <span>LEARNING</span>
            <span>FUTURE EXPLORATION</span>
          </div>
          {project.applicationUrl && (
            <a
              className="button primary"
              href={project.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              앱 실행 ↗
            </a>
          )}
          {project.repositoryUrl && (
            <a
              className="text-link"
              href={project.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              저장소 ↗
            </a>
          )}
          <p className="muted small">
            실행 링크는 프로젝트가 준비되면 공개됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
