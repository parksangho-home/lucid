import test from "node:test";
import assert from "node:assert/strict";
import { syncLotto } from "../lib/lotto/sync.ts";

function fakeDb(latest = 0) {
  const saved = new Map();
  for (let n = 1; n <= latest; n++) saved.set(n, { drawNumber: n });
  const ranges = [];
  let open = false;
  const dependencies = {
    getLatestCompletedDrawNumber: async () => Math.max(0, ...saved.keys()),
    fetchLatestDrawNumber: async () => 3,
    fetchOfficialRange: async (start, end) => {
      ranges.push([start, end]);
      return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => ({ drawNumber: start + i, drawDate: new Date(Date.UTC(2026, 8, 5 + (start + i - 1) * 7)).toISOString().slice(0, 10), numbers: [1, 2, 3, 4, 5, 6] }));
    },
    importDraw: async (draw) => {
      if (saved.has(draw.drawNumber)) return { imported: false, checked: 0 };
      saved.set(draw.drawNumber, draw);
      return { imported: true, checked: 0 };
    },
    ensureNextOpenDraw: async () => { const created = !open; open = true; return created; },
  };
  return { dependencies, ranges, saved };
}

test("full sync, repeated full sync, and incremental sync are idempotent", async () => {
  const db = fakeDb();
  assert.deepEqual(await syncLotto("all", db.dependencies), { officialLatest: 3, imported: 3, skipped: 0, checked: 0, openCreated: true });
  assert.deepEqual(await syncLotto("all", db.dependencies), { officialLatest: 3, imported: 0, skipped: 3, checked: 0, openCreated: false });
  assert.deepEqual(await syncLotto("incremental", db.dependencies), { officialLatest: 3, imported: 0, skipped: 0, checked: 0, openCreated: false });
  assert.deepEqual(db.ranges, [[1, 3], [1, 3], [4, 3]]);
  assert.equal(db.saved.size, 3);
});

test("incremental sync begins after the latest completed draw", async () => {
  const db = fakeDb(1);
  assert.equal((await syncLotto("incremental", db.dependencies)).imported, 2);
  assert.deepEqual(db.ranges, [[2, 3]]);
});

test("saved draw mismatch halts sync before next draw", async () => {
  const db = fakeDb();
  let attempts = 0;
  db.dependencies.importDraw = async () => { attempts++; throw new Error("A completed draw cannot be changed."); };
  await assert.rejects(syncLotto("all", db.dependencies), /cannot be changed/);
  assert.equal(attempts, 1);
});
