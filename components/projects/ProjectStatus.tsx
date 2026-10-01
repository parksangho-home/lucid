import type { Project } from "@/data/projects";

const labels = {
  active: "ACTIVE",
  development: "DEVELOPMENT",
  "coming-soon": "COMING SOON",
};
export function ProjectStatus({ status }: { status: Project["status"] }) {
  return (
    <span className={`status ${status}`}>
      <span aria-hidden="true">●</span> {labels[status]}
    </span>
  );
}
