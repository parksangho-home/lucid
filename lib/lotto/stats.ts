import { STRATEGIES, type Prediction } from "./types.ts";

export function summarize(predictions: Prediction[]) {
  const checked = predictions.filter((item) => item.matchCount !== null);
  const participation = new Set(predictions.map((item) => item.drawNumber)).size;
  const distribution = Array.from(
    { length: 7 },
    (_, matches) => checked.filter((item) => item.matchCount === matches).length,
  );
  const average = checked.length
    ? checked.reduce((sum, item) => sum + Number(item.matchCount), 0) /
      checked.length
    : null;
  const best = checked.length
    ? Math.max(...checked.map((item) => Number(item.matchCount)))
    : null;
  const strategies = STRATEGIES.map((strategy) => {
    const matches = checked.filter((item) => item.strategy === strategy);
    return {
      strategy,
      games: predictions.filter((item) => item.strategy === strategy).length,
      checked: matches.length,
      average: matches.length
        ? matches.reduce((sum, item) => sum + Number(item.matchCount), 0) /
          matches.length
        : null,
      threePlus: matches.filter((item) => Number(item.matchCount) >= 3).length,
    };
  });
  return {
    participation,
    games: predictions.length,
    checked: checked.length,
    distribution,
    average,
    best,
    strategies,
  };
}
