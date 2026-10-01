export type Project = {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "active" | "development" | "coming-soon";
  theme: "cyan" | "violet" | "muted";
  href?: string;
  applicationUrl?: string;
  repositoryUrl?: string;
};

export const projects: Project[] = [
  {
    id: "lotto",
    name: "LOTTO LAB",
    category: "Probability · Data",
    description:
      "매주 다섯 전략으로 추천한 번호를 실제 당첨 결과와 비교하고 성적을 기록하는 데이터 실험입니다.",
    status: "active",
    theme: "cyan",
    href: "/projects/lotto",
  },
  {
    id: "baduk",
    name: "BADUK LAB",
    category: "Game · Learning",
    description:
      "한 수씩 배우고, 조금씩 깊어지는 생각. 직접 만들며 탐구하는 바둑 학습 프로젝트입니다.",
    status: "development",
    theme: "violet",
    href: "/projects/baduk",
  },
  {
    id: "next",
    name: "NEXT MISSION",
    category: "Uncharted territory",
    description: "Something new is coming...",
    status: "coming-soon",
    theme: "muted",
  },
];
