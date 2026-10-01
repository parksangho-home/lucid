export type Tool = {
  id: string;
  name: string;
  description: string;
  symbol: string;
  href?: string;
};

export const tools: Tool[] = [
  {
    id: "random",
    name: "Random Generator",
    description: "작은 선택에 새로운 우연을 더하는 도구",
    symbol: "⤨",
  },
  {
    id: "converter",
    name: "Unit Converter",
    description: "다양한 단위를 간편하게 변환하는 도구",
    symbol: "⇄",
  },
  {
    id: "productivity",
    name: "Productivity Tool",
    description: "일상의 반복을 줄이고 집중을 돕는 도구",
    symbol: "⌘",
  },
];
