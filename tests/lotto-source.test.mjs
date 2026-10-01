import test from "node:test";
import assert from "node:assert/strict";
import { parseOfficialDraw, parseOfficialList, parseLatestFromPage, validateSequence } from "../lib/lotto/source.ts";

const row = { ltEpsd: 1, ltRflYmd: "20021207", tm1WnNo: 10, tm2WnNo: 23, tm3WnNo: 29, tm4WnNo: 33, tm5WnNo: 37, tm6WnNo: 40, bnsWnNo: 16 };
test("official JSON parser extracts six numbers and excludes bonus", () => {
  assert.deepEqual(parseOfficialDraw(row), { drawNumber: 1, drawDate: "2002-12-07", numbers: [10, 23, 29, 33, 37, 40] });
  assert.equal(parseOfficialList({ data: { list: [row] } }).length, 1);
});
test("official parser rejects invalid numbers, dates and sequence", () => {
  assert.throws(() => parseOfficialDraw({ ...row, tm6WnNo: 46 }));
  assert.throws(() => parseOfficialDraw({ ...row, tm6WnNo: 10 }));
  assert.throws(() => parseOfficialDraw({ ...row, ltRflYmd: "20260230" }));
  assert.throws(() => parseOfficialList({ data: { list: [row, { ...row, ltEpsd: 3, ltRflYmd: "20021221" }] } }));
  assert.throws(() => validateSequence([parseOfficialDraw(row)], 1, 2));
});
test("latest selection must include first and selected latest draw", () => {
  const html = '<input id="opt_val" value="2"><ul id="ltEpsdDiv"><li><button class="option-il" data-value="2">2회</button></li><li><button class="option-il" data-value="1">1회</button></li></ul>';
  assert.equal(parseLatestFromPage(html), 2);
  assert.throws(() => parseLatestFromPage(html.replace('data-value="1"', 'data-value="0"')));
});
