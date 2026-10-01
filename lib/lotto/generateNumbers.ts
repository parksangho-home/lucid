// Partial Fisher–Yates shuffle: six unique choices, then ascending order.
export function generateNumbers(random: () => number = Math.random): number[] {
  const pool = Array.from({ length: 45 }, (_, index) => index + 1);
  for (let index = 0; index < 6; index++) {
    const value = random();
    if (value < 0 || value >= 1 || !Number.isFinite(value))
      throw new RangeError("Random value must be in [0, 1).");
    const selected = index + Math.floor(value * (pool.length - index));
    [pool[index], pool[selected]] = [pool[selected], pool[index]];
  }
  return pool.slice(0, 6).sort((a, b) => a - b);
}
