export type Comparison = {
  matchCount: number;
};

export function comparePrediction(
  prediction: number[],
  winning: number[],
): Comparison {
  const winners = new Set(winning);
  const matchCount = prediction.filter((number) => winners.has(number)).length;
  return { matchCount };
}

export function validateDraw(numbers: number[]) {
  if (
    numbers.length !== 6 ||
    new Set(numbers).size !== 6 ||
    !numbers.every((n) => Number.isInteger(n) && n >= 1 && n <= 45)
  ) {
    throw new Error(
      "Draw must contain six unique numbers from 1–45.",
    );
  }
}
