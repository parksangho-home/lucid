import test from "node:test";
import assert from "node:assert/strict";
import { generateNumbers } from "../lib/lotto/generateNumbers.ts";

test("10,000 generations contain six unique, sorted integers from 1 to 45", () => {
  for (let index = 0; index < 10_000; index++) {
    const numbers = generateNumbers();
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
});

test("both random boundaries produce valid combinations", () => {
  assert.deepEqual(
    generateNumbers(() => 0),
    [1, 2, 3, 4, 5, 6],
  );
  assert.deepEqual(
    generateNumbers(() => 1 - Number.EPSILON),
    [1, 2, 3, 4, 5, 45],
  );
});

test("invalid random sources are rejected", () => {
  for (const value of [-1, 1, NaN, Infinity]) {
    assert.throws(() => generateNumbers(() => value), RangeError);
  }
});
