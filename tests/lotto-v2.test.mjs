import test from "node:test";
import assert from "node:assert/strict";
import {
  generateFive,
  generateForStrategy,
  balanceScore,
} from "../lib/lotto/strategies.ts";
import { comparePrediction, validateDraw } from "../lib/lotto/results.ts";
import { isDrawOpen } from "../lib/lotto/storage-supabase.ts";
import { summarize } from "../lib/lotto/stats.ts";
import { STRATEGIES } from "../lib/lotto/types.ts";
import { getLottoBallRange } from "../lib/lotto/ball-range.ts";

const history = Array.from({ length: 35 }, (_, index) => ({
  drawNumber: index + 1,
  drawDate: new Date(Date.UTC(2025, 0, 4 + index * 7))
    .toISOString()
    .slice(0, 10),
  numbers: [
    1 + (index % 7),
    9 + (index % 7),
    17 + (index % 7),
    25 + (index % 7),
    33 + (index % 7),
    40 + (index % 6),
  ],
}));

test("all five strategies make valid six-number games", () => {
  for (let iteration = 0; iteration < 100; iteration++) {
    const games = generateFive(history);
    assert.deepEqual(
      games.map((game) => game.strategy),
      STRATEGIES,
    );
    for (const { numbers } of games) {
      assert.equal(numbers.length, 6);
      assert.equal(new Set(numbers).size, 6);
      assert.ok(
        numbers.every(
          (number) => Number.isInteger(number) && number >= 1 && number <= 45,
        ),
      );
      assert.deepEqual(
        numbers,
        [...numbers].sort((a, b) => a - b),
      );
    }
  }
  assert.ok(Number.isFinite(balanceScore([1, 11, 20, 30, 39, 45])));
  assert.deepEqual(
    generateForStrategy("random", history, () => 0),
    [1, 2, 3, 4, 5, 6],
  );
});

test("comparison uses the six winning numbers only", () => {
  const winning = [1, 2, 3, 4, 5, 6];
  assert.deepEqual(comparePrediction(winning, winning), { matchCount: 6 });
  assert.deepEqual(comparePrediction([1, 2, 3, 4, 5, 7], winning), { matchCount: 5 });
  assert.deepEqual(comparePrediction([1, 2, 8, 9, 10, 11], winning), { matchCount: 2 });
});

test("draw validation and draw-day cutoff reject invalid inputs", () => {
  assert.throws(() => validateDraw([1, 1, 2, 3, 4, 5]));
  assert.throws(() => validateDraw([1, 2, 3, 4, 5, 46]));
  assert.doesNotThrow(() => validateDraw([1, 2, 3, 4, 5, 6]));
  assert.equal(
    isDrawOpen("2026-09-26", new Date("2026-09-26T08:59:59Z")),
    true,
  );
  assert.equal(
    isDrawOpen("2026-09-26", new Date("2026-09-26T09:00:00Z")),
    false,
  );
});

test("personal statistics use only completed games for match averages", () => {
  const base = {
    id: 1,
    drawDate: "2026-09-26",
    numbers: [1, 2, 3, 4, 5, 6],
    createdAt: "2026-09-20",
  };
  const rows = [
    {
      ...base,
      drawNumber: 1,
      strategy: "random",
      matchCount: 2,
    },
    {
      ...base,
      drawNumber: 1,
      strategy: "frequency",
      matchCount: 4,
    },
    {
      ...base,
      drawNumber: 2,
      strategy: "random",
      matchCount: null,
    },
  ];
  const stats = summarize(rows);
  assert.equal(stats.participation, 2);
  assert.equal(stats.games, 3);
  assert.equal(stats.checked, 2);
  assert.equal(stats.average, 3);
  assert.equal(stats.best, 4);
  assert.deepEqual(stats.distribution, [0, 0, 1, 0, 1, 0, 0]);
  assert.equal(
    stats.strategies.find((item) => item.strategy === "random").average,
    2,
  );
});

test("lotto balls map all number ranges to the five color classes", () => {
  assert.deepEqual([1, 10, 11, 20, 21, 30, 31, 40, 41, 45].map(getLottoBallRange), [1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
});
