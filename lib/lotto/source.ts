import type { Draw } from "./types.ts";
import { validateDraw } from "./results.ts";

export const OFFICIAL_PAGE = "https://www.dhlottery.co.kr/lt645/result";
const OFFICIAL_JSON = "https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do";

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid official draw data: expected an object.");
  return value as Record<string, unknown>;
}

export function parseOfficialDraw(value: unknown): Draw {
  const row = record(value);
  const drawNumber = row.ltEpsd;
  const rawDate = row.ltRflYmd;
  if (!Number.isInteger(drawNumber) || Number(drawNumber) < 1 ||
      typeof rawDate !== "string" || !/^\d{8}$/.test(rawDate))
    throw new Error("Invalid official draw data: draw number or date.");
  const drawDate = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
  if (new Date(`${drawDate}T00:00:00Z`).toISOString().slice(0, 10) !== drawDate)
    throw new Error("Invalid official draw data: invalid calendar date.");
  const numbers = [1, 2, 3, 4, 5, 6].map((index) => row[`tm${index}WnNo`]);
  validateDraw(numbers as number[]);
  return { drawNumber: Number(drawNumber), drawDate, numbers: (numbers as number[]).sort((a, b) => a - b) };
}

export function parseOfficialList(value: unknown): Draw[] {
  const envelope = record(value);
  const data = record(envelope.data);
  if (!Array.isArray(data.list) || !data.list.length)
    throw new Error("Invalid official draw data: empty result list.");
  const draws = data.list.map(parseOfficialDraw).sort((a, b) => a.drawNumber - b.drawNumber);
  for (let i = 1; i < draws.length; i++) {
    if (draws[i].drawNumber !== draws[i - 1].drawNumber + 1 ||
        draws[i].drawDate <= draws[i - 1].drawDate)
      throw new Error("Draw sequence mismatch in official response.");
  }
  return draws;
}

export function parseLatestFromPage(html: string): number {
  const selected = html.match(/id="opt_val"\s+value="(\d+)"/);
  const list = html.match(/id="ltEpsdDiv">([\s\S]*?)<\/ul>/);
  const options = [...(list?.[1] ?? "").matchAll(/class="option-il"\s+data-value="(\d+)"/g)].map((match) => Number(match[1]));
  const latest = Number(selected?.[1]);
  if (!Number.isInteger(latest) || latest < 1 || !options.includes(1) || Math.max(...options) !== latest)
    throw new Error("Invalid official draw data: latest draw selection unavailable.");
  return latest;
}

async function getOfficial(url: string): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Referer: OFFICIAL_PAGE, "X-Requested-With": "XMLHttpRequest", Accept: "application/json, text/html" },
      signal: AbortSignal.timeout(20000),
      cache: "no-store",
    });
  } catch (error) {
    throw new Error("Official lotto source unavailable.", { cause: error });
  }
  if (!response.ok) throw new Error(`Official lotto source unavailable: HTTP ${response.status}.`);
  return response;
}

export async function fetchLatestDrawNumber(): Promise<number> {
  const response = await getOfficial(OFFICIAL_PAGE);
  return parseLatestFromPage(await response.text());
}

export async function fetchOfficialBatch(center: number): Promise<Draw[]> {
  const url = new URL(OFFICIAL_JSON);
  url.searchParams.set("srchDir", "center");
  url.searchParams.set("srchLtEpsd", String(center));
  const response = await getOfficial(url.toString());
  try {
    return parseOfficialList(await response.json());
  } catch (error) {
    throw new Error(`Invalid official draw data near ${center}회.`, { cause: error });
  }
}

export function validateSequence(draws: Draw[], start: number, latest: number) {
  if (draws.length !== latest - start + 1) throw new Error("Draw sequence mismatch: missing official draws.");
  for (let i = 0; i < draws.length; i++) {
    if (draws[i].drawNumber !== start + i ||
        (i && draws[i].drawDate <= draws[i - 1].drawDate))
      throw new Error("Draw sequence mismatch: number or date order.");
  }
}

export async function fetchOfficialRange(start: number, latest: number): Promise<Draw[]> {
  if (start > latest) return [];
  const centers: number[] = [];
  for (let center = Math.max(1, start + 4); center <= latest + 9; center += 9)
    centers.push(Math.min(center, latest));
  const collected = new Map<number, Draw>();
  // Keep traffic bounded; one changed or malformed batch stops the run before DB writes.
  for (let offset = 0; offset < centers.length; offset += 6) {
    const batches = await Promise.all(centers.slice(offset, offset + 6).map(fetchOfficialBatch));
    for (const batch of batches) for (const draw of batch) {
      const prior = collected.get(draw.drawNumber);
      if (prior && JSON.stringify(prior) !== JSON.stringify(draw))
        throw new Error(`Draw sequence mismatch: conflicting official data for ${draw.drawNumber}회.`);
      collected.set(draw.drawNumber, draw);
    }
  }
  const draws = [...collected.values()].filter((draw) => draw.drawNumber >= start && draw.drawNumber <= latest)
    .sort((a, b) => a.drawNumber - b.drawNumber);
  validateSequence(draws, start, latest);
  return draws;
}
