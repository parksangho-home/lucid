export const STRATEGIES = [
  "random",
  "frequency",
  "recency",
  "balanced",
  "lucid",
] as const;
export type Strategy = (typeof STRATEGIES)[number];

export const STRATEGY_DETAILS: Record<
  Strategy,
  { name: string; description: string }
> = {
  random: { name: "RANDOM", description: "비교를 위한 무작위 기준 전략" },
  frequency: { name: "FREQUENCY", description: "전체 과거 출현 빈도에 가중치" },
  recency: { name: "RECENCY", description: "최근 회차에 더 높은 가중치" },
  balanced: { name: "BALANCED", description: "홀짝·구간·합계의 편중 완화" },
  lucid: {
    name: "LUCID MODEL",
    description: "빈도·최근성·장기 미출현·균형 조합",
  },
};

export type Draw = {
  drawNumber: number;
  drawDate: string;
  numbers: number[];
};

export type Prediction = {
  id: number;
  drawNumber: number;
  drawDate: string;
  strategy: Strategy;
  numbers: number[];
  createdAt: string;
  matchCount: number | null;
};
