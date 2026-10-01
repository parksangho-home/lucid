import { generateNumbers } from "./generateNumbers.ts";
import { STRATEGIES, type Draw, type Strategy } from "./types.ts";

function weightedPick(weights: number[], random: () => number): number[] {
  const remaining = weights.map((weight, index) => ({
    number: index + 1,
    weight: Math.max(weight, 0.01),
  }));
  const result: number[] = [];
  for (let pick = 0; pick < 6; pick++) {
    const total = remaining.reduce((sum, item) => sum + item.weight, 0);
    let cursor = random() * total;
    let selected = remaining.length - 1;
    for (let index = 0; index < remaining.length; index++) {
      cursor -= remaining[index].weight;
      if (cursor < 0) {
        selected = index;
        break;
      }
    }
    result.push(remaining.splice(selected, 1)[0].number);
  }
  return result.sort((a, b) => a - b);
}

function counts(draws: Draw[], multiplier: (age: number) => number): number[] {
  const weights = Array(45).fill(1) as number[];
  [...draws].reverse().forEach((draw, age) => {
    draw.numbers.forEach((number) => {
      weights[number - 1] += multiplier(age);
    });
  });
  return weights;
}

export function balanceScore(numbers: number[]): number {
  const odds = numbers.filter((number) => number % 2).length;
  const low = numbers.filter((number) => number <= 22).length;
  const buckets = new Set(
    numbers.map((number) => Math.floor((number - 1) / 10)),
  ).size;
  const sum = numbers.reduce((a, b) => a + b, 0);
  const adjacent = numbers
    .slice(1)
    .filter((number, index) => number === numbers[index] + 1).length;
  const endings = Math.max(
    ...Array.from(
      { length: 10 },
      (_, ending) => numbers.filter((number) => number % 10 === ending).length,
    ),
  );
  return (
    -Math.abs(odds - 3) * 2 -
    Math.abs(low - 3) * 2 +
    buckets * 1.5 -
    Math.abs(sum - 138) / 30 -
    Math.max(0, adjacent - 1) * 2 -
    Math.max(0, endings - 2) * 2
  );
}

function balanced(random: () => number): number[] {
  let best = generateNumbers(random);
  let bestScore = balanceScore(best);
  for (let trial = 0; trial < 79; trial++) {
    const candidate = generateNumbers(random);
    const score = balanceScore(candidate);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

function lucid(draws: Draw[], random: () => number): number[] {
  const frequency = counts(draws, () => 1);
  const recent = counts(draws.slice(-30), (age) => Math.exp(-age / 10));
  const lastSeen = Array(45).fill(draws.length) as number[];
  [...draws].reverse().forEach((draw, age) => {
    draw.numbers.forEach((number) => {
      if (lastSeen[number - 1] === draws.length) lastSeen[number - 1] = age;
    });
  });
  const maxFrequency = Math.max(...frequency);
  const maxRecent = Math.max(...recent);
  const weights = frequency.map(
    (value, index) =>
      1 +
      (value / maxFrequency) * 2 +
      (recent[index] / maxRecent) * 2 +
      Math.min(lastSeen[index], 30) / 30,
  );
  let best = weightedPick(weights, random);
  let bestScore = balanceScore(best);
  for (let trial = 0; trial < 39; trial++) {
    const candidate = weightedPick(weights, random);
    const score = balanceScore(candidate);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

export function generateForStrategy(
  strategy: Strategy,
  history: Draw[],
  random: () => number = Math.random,
): number[] {
  switch (strategy) {
    case "random":
      return generateNumbers(random);
    case "frequency":
      return weightedPick(
        counts(history, () => 1),
        random,
      );
    case "recency":
      return weightedPick(
        counts(history.slice(-30), (age) => Math.exp(-age / 10)),
        random,
      );
    case "balanced":
      return balanced(random);
    case "lucid":
      return lucid(history, random);
  }
}

export function generateFive(
  history: Draw[],
  random: () => number = Math.random,
) {
  return STRATEGIES.map((strategy) => ({
    strategy,
    numbers: generateForStrategy(strategy, history, random),
  }));
}
