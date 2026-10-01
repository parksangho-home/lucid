import { PageIntro } from "@/components/ui/PageIntro";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
export const metadata = { title: "PROJECTS" };
export default function ProjectsPage() {
  return (
    <div className="container inner-page">
      <PageIntro
        label="EXPLORATION / PROJECTS"
        title="IDEAS IN ORBIT"
        description="아이디어가 실험이 되고, 실험이 프로젝트가 됩니다. 각각의 행성에서 새로운 가능성을 탐험해 보세요."
      />
      <ProjectGrid />
    </div>
  );
}
