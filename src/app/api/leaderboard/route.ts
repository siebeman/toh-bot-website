import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAIN_SHEET_ID = "1RsPrUbDIQzCvN1xqw5pZIK3KmabZi-ZCwRwkoQuWSfM";
const MAIN_SHEET_GID = "0";
const YXLES_SHEET_ID = "1GdEDCCkSeH2ov4aXwP_7TKQbw_UtpduoM7ftKONERd4";
const YXLES_SHEET_GID = "0";

const MAIN_BANNED_TITLE = "Banned Level Leaderboard";
const YXLES_BANNED_TITLE = "Banned Yxles Leaderboard";

type Player = {
  rank: number;
  username: string;
  level: number;
  country: string;
  device: string;
  last_updated: string;
};

type BannedPlayer = {
  rank: number;
  username: string;
  level: string;
  country: string;
  ban_reason: string;
  device: string;
};

type YxlesPlayer = {
  rank: number;
  username: string;
  yxles: string;
  yxles_value: number;
  country: string;
  device: string;
  last_updated: string;
};

type YxlesBannedPlayer = {
  rank: number;
  username: string;
  yxles: string;
  yxles_value: number;
  country: string;
  ban_reason: string;
  device: string;
};

type ActiveMetricPlayer = {
  rank: number;
  username: string;
  metric: string;
  metric_value: number;
  country: string;
  device: string;
  last_updated: string;
};

type BannedMetricPlayer = {
  rank: number;
  username: string;
  metric: string;
  metric_value: number;
  country: string;
  last_updated: string;
  ban_reason: string;
  device: string;
};

type ParsedSheet = {
  players: Player[];
  banned: BannedPlayer[];
};

type ParsedYxlesSheet = {
  yxles: YxlesPlayer[];
  yxles_banned: YxlesBannedPlayer[];
};

function buildCsvUrl(sheetId: string, gid: string) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

async function fetchCsv(sheetId: string, gid: string) {
  const response = await fetch(buildCsvUrl(sheetId, gid), {
    cache: "no-store",
    headers: {
      accept: "text/csv,text/plain;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Google Sheets returned HTTP ${response.status}`);
  }

  return response.text();
}

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const nextChar = csv[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += char;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  return rows.filter((row) => row.some((cell) => cell !== ""));
}

function getCell(row: string[] | undefined, columnIndex: number) {
  return row?.[columnIndex]?.trim() ?? "";
}

function parseRank(rawValue: string) {
  const digits = rawValue.replace(/[^\d]/g, "");
  if (!digits) return null;
  const rank = Number.parseInt(digits, 10);
  return Number.isFinite(rank) ? rank : null;
}

function normalizeText(rawValue: string, fallback = "-") {
  const value = rawValue.trim();
  return value ? value : fallback;
}

function parseNumber(rawValue: string) {
  const cleaned = rawValue.replace(/,/g, "").trim();
  if (!cleaned) return 0;
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseAbbreviatedNumber(rawValue: string) {
  const cleaned = rawValue.replace(/\+/g, "").replace(/,/g, "").trim();
  if (!cleaned) return 0;

  const match = cleaned.match(/^([\d.]+)\s*([KMB])?$/i);
  if (!match) return 0;

  const value = Number.parseFloat(match[1]);
  if (!Number.isFinite(value)) return 0;

  const suffix = (match[2] || "").toUpperCase();
  if (suffix === "B") return value * 1_000_000_000;
  if (suffix === "M") return value * 1_000_000;
  if (suffix === "K") return value * 1_000;
  return value;
}

function normalizeDate(rawValue: string) {
  const value = rawValue.trim();
  if (!value) return "-";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const isoDateTime = value.match(/^(\d{4}-\d{2}-\d{2})[ T]/);
  if (isoDateTime) {
    return isoDateTime[1];
  }

  const slashDate = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashDate) {
    const day = Number.parseInt(slashDate[1], 10);
    const month = Number.parseInt(slashDate[2], 10);
    let year = Number.parseInt(slashDate[3], 10);
    if (year < 100) year += 2000;
    return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  }

  const parsedTimestamp = Date.parse(value);
  if (Number.isFinite(parsedTimestamp)) {
    return new Date(parsedTimestamp).toISOString().slice(0, 10);
  }

  return value;
}

function findColumnIndex(row: string[] | undefined, value: string) {
  return row?.findIndex((cell) => cell.trim() === value) ?? -1;
}

function findRankBlocks(row: string[] | undefined, startAt = 0, endBefore?: number) {
  const headerRow = row ?? [];
  const limit = typeof endBefore === "number" ? Math.min(endBefore, headerRow.length) : headerRow.length;
  const starts: number[] = [];

  for (let column = startAt; column < limit; column += 1) {
    if (headerRow[column]?.trim() === "Rank") {
      starts.push(column);
    }
  }

  return starts;
}

function parseActiveMetricRows(
  rows: string[][],
  blockStarts: number[],
  dataStartRow: number,
  parseMetricValue: (rawValue: string) => number,
) {
  const players: ActiveMetricPlayer[] = [];

  for (let rowIndex = dataStartRow; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];

    for (const blockStart of blockStarts) {
      const rank = parseRank(getCell(row, blockStart));
      if (rank === null) continue;

      const username = getCell(row, blockStart + 1);
      if (!username || username === "Username") continue;

      const metricRaw = getCell(row, blockStart + 2);
      const metricValue = parseMetricValue(metricRaw);

      players.push({
        rank,
        username,
        metric: metricRaw || "0",
        metric_value: metricValue,
        last_updated: normalizeDate(getCell(row, blockStart + 3)),
        country: normalizeText(getCell(row, blockStart + 5)),
        device: normalizeText(getCell(row, blockStart + 6)),
      });
    }
  }

  return dedupeByRank(players).sort((left, right) => left.rank - right.rank);
}

function parseBannedMetricRows(
  rows: string[][],
  blockStarts: number[],
  dataStartRow: number,
  parseMetricValue: (rawValue: string) => number,
) {
  const players: BannedMetricPlayer[] = [];

  for (let rowIndex = dataStartRow; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];

    for (const blockStart of blockStarts) {
      const rank = parseRank(getCell(row, blockStart));
      if (rank === null) continue;

      const username = getCell(row, blockStart + 1);
      if (!username || username === "Username") continue;

      const metricRaw = getCell(row, blockStart + 2);

      players.push({
        rank,
        username,
        metric: metricRaw || "0",
        metric_value: parseMetricValue(metricRaw),
        country: normalizeText(getCell(row, blockStart + 4)),
        last_updated: normalizeDate(getCell(row, blockStart + 5)),
        ban_reason: normalizeText(getCell(row, blockStart + 6), "Unknown"),
        device: normalizeText(getCell(row, blockStart + 7)),
      });
    }
  }

  return dedupeByRank(players).sort((left, right) => left.rank - right.rank);
}

function dedupeByRank<T extends { rank: number }>(items: T[]) {
  const seen = new Set<number>();
  return items.filter((item) => {
    if (seen.has(item.rank)) return false;
    seen.add(item.rank);
    return true;
  });
}

function parseMainLeaderboard(csv: string): ParsedSheet {
  const rows = parseCsv(csv);
  const headerRow = rows[0];
  const bannedTitleColumn = findColumnIndex(headerRow, MAIN_BANNED_TITLE);
  const activeBlockStarts = findRankBlocks(headerRow, 0, bannedTitleColumn > -1 ? bannedTitleColumn : undefined);

  const bannedHeaderRowIndex = rows.findIndex((row, index) => index > 0 && findColumnIndex(row, "Ban Reason") > -1);
  const bannedHeaderRow = bannedHeaderRowIndex > -1 ? rows[bannedHeaderRowIndex] : undefined;
  const bannedBlockStarts = findRankBlocks(
    bannedHeaderRow,
    bannedTitleColumn > -1 ? bannedTitleColumn : 0,
  );

  const activePlayers = parseActiveMetricRows(rows, activeBlockStarts, 1, parseNumber).map((player) => ({
    rank: player.rank,
    username: player.username,
    level: Math.round(player.metric_value),
    country: player.country,
    device: player.device,
    last_updated: player.last_updated,
  }));

  const bannedPlayers = bannedHeaderRowIndex > -1
    ? parseBannedMetricRows(rows, bannedBlockStarts, bannedHeaderRowIndex + 1, parseNumber).map((player) => ({
        rank: player.rank,
        username: player.username,
        level: player.metric,
        country: player.country,
        ban_reason: player.ban_reason,
        device: player.device,
      }))
    : [];

  return {
    players: activePlayers,
    banned: bannedPlayers,
  };
}

function parseYxlesLeaderboard(csv: string): ParsedYxlesSheet {
  const rows = parseCsv(csv);
  const headerRow = rows[0];
  const bannedTitleColumn = findColumnIndex(headerRow, YXLES_BANNED_TITLE);
  const activeBlockStarts = findRankBlocks(headerRow, 0, bannedTitleColumn > -1 ? bannedTitleColumn : undefined);

  const bannedHeaderRowIndex = rows.findIndex((row, index) => index > 0 && findColumnIndex(row, "Ban Reason") > -1);
  const bannedHeaderRow = bannedHeaderRowIndex > -1 ? rows[bannedHeaderRowIndex] : undefined;
  const bannedBlockStarts = findRankBlocks(
    bannedHeaderRow,
    bannedTitleColumn > -1 ? bannedTitleColumn : 0,
  );

  const activePlayers = parseActiveMetricRows(rows, activeBlockStarts, 1, parseAbbreviatedNumber).map((player) => ({
    rank: player.rank,
    username: player.username,
    yxles: player.metric,
    yxles_value: player.metric_value,
    country: player.country,
    device: player.device,
    last_updated: player.last_updated,
  }));

  const bannedPlayers = bannedHeaderRowIndex > -1
    ? parseBannedMetricRows(rows, bannedBlockStarts, bannedHeaderRowIndex + 1, parseAbbreviatedNumber).map((player) => ({
        rank: player.rank,
        username: player.username,
        yxles: player.metric,
        yxles_value: player.metric_value,
        country: player.country,
        ban_reason: player.ban_reason,
        device: player.device,
      }))
    : [];

  return {
    yxles: activePlayers,
    yxles_banned: bannedPlayers,
  };
}

export async function GET() {
  const [mainResult, yxlesResult] = await Promise.allSettled([
    fetchCsv(MAIN_SHEET_ID, MAIN_SHEET_GID).then(parseMainLeaderboard),
    fetchCsv(YXLES_SHEET_ID, YXLES_SHEET_GID).then(parseYxlesLeaderboard),
  ]);

  if (mainResult.status === "rejected" && yxlesResult.status === "rejected") {
    return NextResponse.json(
      { error: "Failed to fetch leaderboard data" },
      { status: 502 },
    );
  }

  const main = mainResult.status === "fulfilled"
    ? mainResult.value
    : { players: [], banned: [] };

  const yxles = yxlesResult.status === "fulfilled"
    ? yxlesResult.value
    : { yxles: [], yxles_banned: [] };

  return NextResponse.json({
    ...main,
    ...yxles,
    fetchedAt: new Date().toISOString(),
    partial: mainResult.status === "rejected" || yxlesResult.status === "rejected",
  });
}
