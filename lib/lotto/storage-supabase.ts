import { createAdminClient } from "../supabase/admin.ts";
import { generateFive } from "./strategies.ts";
import { comparePrediction, validateDraw } from "./results.ts";
import {
  STRATEGIES,
  type Draw,
  type Prediction,
  type Strategy,
} from "./types.ts";

type DrawRow = {
  draw_number: number;
  draw_date: string;
  status: "open" | "completed";
  number_1: number | null;
  number_2: number | null;
  number_3: number | null;
  number_4: number | null;
  number_5: number | null;
  number_6: number | null;
  completed_at?: string | null;
};

type PredictionRow = {
  id: number;
  user_id: string;
  draw_number: number;
  strategy: Strategy;
  number_1: number;
  number_2: number;
  number_3: number;
  number_4: number;
  number_5: number;
  number_6: number;
  created_at: string;
};

function requireData<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  if (data === null) throw new Error("Database returned no data.");
  return data;
}

function drawFromRow(row: DrawRow): Draw {
  return {
    drawNumber: row.draw_number,
    drawDate: row.draw_date,
    numbers: [
      row.number_1,
      row.number_2,
      row.number_3,
      row.number_4,
      row.number_5,
      row.number_6,
    ].map(Number),
  };
}

function predictionFromRow(
  row: PredictionRow,
  drawDate: string,
  matchCount: number | null,
): Prediction {
  return {
    id: Number(row.id),
    drawNumber: row.draw_number,
    drawDate,
    strategy: row.strategy,
    numbers: [
      row.number_1,
      row.number_2,
      row.number_3,
      row.number_4,
      row.number_5,
      row.number_6,
    ],
    createdAt: row.created_at,
    matchCount,
  };
}

export function isDrawOpen(drawDate: string, now = new Date()) {
  return now.getTime() < new Date(`${drawDate}T18:00:00+09:00`).getTime();
}

export async function getDashboard(userId?: string) {
  const db = createAdminClient();

  const completedQuery = await db
    .from("lotto_draws")
    .select("*")
    .eq("status", "completed")
    .order("draw_number", { ascending: false })
    .limit(1);
  const completedRows = requireData(
    completedQuery.data as DrawRow[] | null,
    completedQuery.error,
  );

  const openQuery = await db
    .from("lotto_draws")
    .select("*")
    .eq("status", "open")
    .order("draw_number", { ascending: false })
    .limit(1);
  const openRows = requireData(openQuery.data as DrawRow[] | null, openQuery.error);

  const current = openRows[0]
    ? {
        drawNumber: openRows[0].draw_number,
        drawDate: openRows[0].draw_date,
        open: isDrawOpen(openRows[0].draw_date),
      }
    : null;
  const previous = completedRows[0] ? drawFromRow(completedRows[0]) : null;

  let predictions: Prediction[] = [];
  if (userId) {
    const predictionQuery = await db
      .from("lotto_predictions")
      .select("*")
      .eq("user_id", userId)
      .order("draw_number", { ascending: false });
    const rows = requireData(
      predictionQuery.data as PredictionRow[] | null,
      predictionQuery.error,
    );

    const drawNumbers = [...new Set(rows.map((row) => row.draw_number))];
    const ids = rows.map((row) => Number(row.id));

    const drawDates = new Map<number, string>();
    if (drawNumbers.length) {
      const drawsQuery = await db
        .from("lotto_draws")
        .select("draw_number,draw_date")
        .in("draw_number", drawNumbers);
      const draws = requireData(
        drawsQuery.data as Array<{ draw_number: number; draw_date: string }> | null,
        drawsQuery.error,
      );
      draws.forEach((draw) => drawDates.set(draw.draw_number, draw.draw_date));
    }

    const matchCounts = new Map<number, number>();
    if (ids.length) {
      const resultsQuery = await db
        .from("lotto_results")
        .select("prediction_id,match_count")
        .in("prediction_id", ids);
      const results = requireData(
        resultsQuery.data as
          | Array<{ prediction_id: number; match_count: number }>
          | null,
        resultsQuery.error,
      );
      results.forEach((result) =>
        matchCounts.set(Number(result.prediction_id), result.match_count),
      );
    }

    const order = new Map(STRATEGIES.map((strategy, index) => [strategy, index]));
    predictions = rows
      .map((row) =>
        predictionFromRow(
          row,
          drawDates.get(row.draw_number) ?? "",
          matchCounts.get(Number(row.id)) ?? null,
        ),
      )
      .sort(
        (a, b) =>
          b.drawNumber - a.drawNumber ||
          (order.get(a.strategy) ?? 0) - (order.get(b.strategy) ?? 0),
      );
  }

  return { current, previous, predictions };
}

export class PickError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function createWeeklyPicks(userId: string) {
  const db = createAdminClient();
  const { data: authUser, error: userError } = await db.auth.admin.getUserById(userId);
  if (userError || !authUser.user)
    throw new PickError("로그인이 필요합니다.", 401);

  const openQuery = await db
    .from("lotto_draws")
    .select("*")
    .eq("status", "open")
    .order("draw_number", { ascending: false })
    .limit(1);
  const draws = requireData(openQuery.data as DrawRow[] | null, openQuery.error);
  const draw = draws[0];
  if (!draw || !isDrawOpen(draw.draw_date)) {
    throw new PickError(
      "현재 추천 가능한 회차가 없습니다. 최신 당첨 데이터 반영을 기다려 주세요.",
      409,
    );
  }

  const existingQuery = await db
    .from("lotto_predictions")
    .select("strategy")
    .eq("user_id", userId)
    .eq("draw_number", draw.draw_number);
  const existing = requireData(existingQuery.data, existingQuery.error);
  if (existing.length) {
    throw new PickError("이 회차의 추천 5게임이 이미 저장되었습니다.", 409);
  }

  const historyRows: DrawRow[] = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const historyQuery = await db
      .from("lotto_draws")
      .select("*")
      .eq("status", "completed")
      .lt("draw_number", draw.draw_number)
      .order("draw_number", { ascending: true })
      .range(offset, offset + pageSize - 1);
    const page = requireData(
      historyQuery.data as DrawRow[] | null,
      historyQuery.error,
    );
    historyRows.push(...page);
    if (page.length < pageSize) break;
  }
  if (historyRows.length < 10) {
    throw new PickError(
      "전략 계산을 위해 완료된 추첨 데이터가 최소 10회 필요합니다.",
      409,
    );
  }

  const games = generateFive(historyRows.map(drawFromRow));
  const insertRows = games.map((game) => ({
    user_id: userId,
    draw_number: draw.draw_number,
    strategy: game.strategy,
    number_1: game.numbers[0],
    number_2: game.numbers[1],
    number_3: game.numbers[2],
    number_4: game.numbers[3],
    number_5: game.numbers[4],
    number_6: game.numbers[5],
  }));
  const { error } = await db.from("lotto_predictions").insert(insertRows);
  if (error) {
    if (error.code === "23505") {
      throw new PickError("이 회차의 추천 5게임이 이미 저장되었습니다.", 409);
    }
    throw new Error(error.message);
  }

  return games;
}

function nextDate(date: string) {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 7);
  return next.toISOString().slice(0, 10);
}

export async function importDraw(draw: Draw) {
  validateDraw(draw.numbers);
  if (
    !Number.isInteger(draw.drawNumber) ||
    draw.drawNumber < 1 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(draw.drawDate) ||
    new Date(`${draw.drawDate}T00:00:00Z`).toISOString().slice(0, 10) !==
      draw.drawDate
  ) {
    throw new Error("Invalid draw number or date.");
  }

  draw = { ...draw, numbers: [...draw.numbers].sort((a, b) => a - b) };
  const db = createAdminClient();

  const existingQuery = await db
    .from("lotto_draws")
    .select("*")
    .eq("draw_number", draw.drawNumber)
    .maybeSingle();
  if (existingQuery.error) throw new Error(existingQuery.error.message);
  const existing = existingQuery.data as DrawRow | null;

  if (existing?.status === "completed") {
    const same =
      existing.draw_date === draw.drawDate &&
      JSON.stringify(drawFromRow(existing).numbers) === JSON.stringify(draw.numbers);
    if (!same) throw new Error("A completed draw cannot be changed.");
    return { imported: false, checked: await saveResultsForDraw(db, draw) };
  }

  const neighborQuery = await db
    .from("lotto_draws")
    .select("*")
    .eq("status", "completed")
    .in("draw_number", [draw.drawNumber - 1, draw.drawNumber + 1]);
  const neighbors = requireData(
    neighborQuery.data as DrawRow[] | null,
    neighborQuery.error,
  );
  const previous = neighbors.find(
    (item) => item.draw_number === draw.drawNumber - 1,
  );
  const next = neighbors.find((item) => item.draw_number === draw.drawNumber + 1);
  if (
    (previous && draw.drawDate !== nextDate(previous.draw_date)) ||
    (next && next.draw_date !== nextDate(draw.drawDate))
  ) {
    throw new Error("Draw sequence mismatch: neighboring dates are not weekly.");
  }

  if (existing && existing.draw_date !== draw.drawDate) {
    throw new Error("Draw date differs from the scheduled date.");
  }

  const drawRow = {
    draw_number: draw.drawNumber,
    draw_date: draw.drawDate,
    status: "completed" as const,
    number_1: draw.numbers[0],
    number_2: draw.numbers[1],
    number_3: draw.numbers[2],
    number_4: draw.numbers[3],
    number_5: draw.numbers[4],
    number_6: draw.numbers[5],
    completed_at: new Date().toISOString(),
  };

  const saveDraw = existing
    ? await db.from("lotto_draws").update(drawRow).eq("draw_number", draw.drawNumber)
    : await db.from("lotto_draws").insert(drawRow);
  if (saveDraw.error) throw new Error(saveDraw.error.message);

  const checked = await saveResultsForDraw(db, draw);

  const latestQuery = await db
    .from("lotto_draws")
    .select("*")
    .eq("status", "completed")
    .order("draw_number", { ascending: false })
    .limit(1);
  const latest = requireData(latestQuery.data as DrawRow[] | null, latestQuery.error);

  if (latest[0]?.draw_number === draw.drawNumber) {
    const openQuery = await db.from("lotto_draws").select("*").eq("status", "open");
    const openRows = requireData(openQuery.data as DrawRow[] | null, openQuery.error);
    const expectedNumber = draw.drawNumber + 1;
    const expectedDate = nextDate(draw.drawDate);
    if (
      openRows.some(
        (item) =>
          item.draw_number !== expectedNumber || item.draw_date !== expectedDate,
      )
    ) {
      throw new Error(
        "Draw sequence mismatch: open draw differs from latest completed draw.",
      );
    }
    if (!openRows.length) {
      const openInsert = await db.from("lotto_draws").insert({
        draw_number: expectedNumber,
        draw_date: expectedDate,
        status: "open",
      });
      if (openInsert.error) throw new Error(openInsert.error.message);
    }
  }

  return { imported: true, checked };
}

async function saveResultsForDraw(db: ReturnType<typeof createAdminClient>, draw: Draw) {
  const predictionsQuery = await db
    .from("lotto_predictions")
    .select("*")
    .eq("draw_number", draw.drawNumber);
  const predictions = requireData(
    predictionsQuery.data as PredictionRow[] | null,
    predictionsQuery.error,
  );

  if (predictions.length) {
    const resultRows = predictions.map((row) => {
      const comparison = comparePrediction(
        [
          row.number_1,
          row.number_2,
          row.number_3,
          row.number_4,
          row.number_5,
          row.number_6,
        ],
        draw.numbers,
      );
      return {
        prediction_id: Number(row.id),
        match_count: comparison.matchCount,
        checked_at: new Date().toISOString(),
      };
    });
    const resultsSave = await db
      .from("lotto_results")
      .upsert(resultRows, { onConflict: "prediction_id" });
    if (resultsSave.error) throw new Error(resultsSave.error.message);
  }

  return predictions.length;
}

export async function getLatestCompletedDrawNumber(): Promise<number> {
  const db = createAdminClient();
  const result = await db
    .from("lotto_draws")
    .select("draw_number")
    .eq("status", "completed")
    .order("draw_number", { ascending: false })
    .limit(1);
  const rows = requireData(
    result.data as Array<{ draw_number: number }> | null,
    result.error,
  );
  return rows[0]?.draw_number ?? 0;
}

export async function ensureNextOpenDraw(): Promise<boolean> {
  const db = createAdminClient();
  const latestQuery = await db
    .from("lotto_draws")
    .select("*")
    .eq("status", "completed")
    .order("draw_number", { ascending: false })
    .limit(1);
  const latest = requireData(
    latestQuery.data as DrawRow[] | null,
    latestQuery.error,
  );
  if (!latest.length) return false;

  const expectedNumber = latest[0].draw_number + 1;
  const expectedDate = nextDate(latest[0].draw_date);
  const openQuery = await db.from("lotto_draws").select("*").eq("status", "open");
  const openRows = requireData(openQuery.data as DrawRow[] | null, openQuery.error);
  if (
    openRows.some(
      (item) =>
        item.draw_number !== expectedNumber || item.draw_date !== expectedDate,
    )
  ) {
    throw new Error(
      "Draw sequence mismatch: open draw differs from latest completed draw.",
    );
  }
  if (openRows.length) return false;

  const insert = await db.from("lotto_draws").insert({
    draw_number: expectedNumber,
    draw_date: expectedDate,
    status: "open",
  });
  if (insert.error) throw new Error(insert.error.message);
  return true;
}
