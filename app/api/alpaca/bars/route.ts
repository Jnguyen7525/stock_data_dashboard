import { NextRequest, NextResponse } from "next/server";

import fs from "fs";
import path from "path";
import {
  computeBollingerBands,
  computeEMA,
  computeOBV,
  computeRSI,
  computeVWAP,
} from "@/lib/indicators";

export function exportChartDataToCSV(
  data: any[],
  filename = "alpaca_training_data.csv"
) {
  if (!data || data.length === 0) {
    console.warn("[CSV Export] No data to write.");
    return;
  }

  const headers = [
    "time",
    "open",
    "high",
    "low",
    "close",
    "volume",
    "ema",
    "rsi",
    "obv",
    "vwap",
    "bb_upper",
    "bb_middle",
    "bb_lower",
  ];

  const rows = data.map((d) =>
    [
      d.time,
      d.open,
      d.high,
      d.low,
      d.close,
      d.volume,
      d.ema,
      d.rsi,
      d.obv,
      d.vwap,
      d.bb_upper,
      d.bb_middle,
      d.bb_lower,
    ].join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  // ✅ Use process.cwd() to get project root
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.join(publicDir, filename);
  fs.writeFileSync(outputPath, csv);
  console.log(`[CSV Export] Wrote ${data.length} rows to ${filename}`);
}

const isDev = process.env.NODE_ENV !== "production";
const ALPACA_API_KEY = process.env.ALPACA_API_KEY!;
const ALPACA_SECRET_KEY = process.env.ALPACA_API_SECRET!;
const BASE_URL = "https://data.alpaca.markets/v2/stocks/bars";

const getStartTime = (granularity: string) => {
  const end = Math.floor(Date.now() / 1000); // Current time in Unix timestamp (seconds)
  let start;
  let timeframe;

  console.log("from getStartTime at the beginning: ", start, end);

  // !FROM ALPACA THESE NUMBERS SEEM TO RETURN THE MAXIMUM ALLOWED BY ALPACA API
  //   Set `start` based on granularity using Unix timestamp calculations
  switch (granularity) {
    case "1Min":
      start = end - 7000 * 60; // 350 minutes
      timeframe = "1Min";
      break;
    case "5Min":
      start = end - 9000 * 5 * 60; // 350 five-minute intervals
      timeframe = "5Min";
      break;
    case "15Min":
      start = end - 9000 * 15 * 60; // 350 fifteen-minute intervals
      timeframe = "15Min";
      break;
    case "30Min":
      start = end - 10000 * 30 * 60; // 350 thirty-minute intervals
      timeframe = "30Min";
      break;
    case "1H":
      start = end - 10000 * 60 * 60; // 350 one-hour intervals
      timeframe = "1Hour";
      break;
    case "1D":
    default:
      start = end - 750 * 24 * 60 * 60; // 350 one-day intervals
      timeframe = "1Day";
      break;
  }

  // Convert Unix timestamp to RFC3339 format (ISO 8601)
  const formatToRFC3339 = (unixTime: number) =>
    new Date(unixTime * 1000).toISOString();

  const nowUnix = Math.floor(Date.now() / 1000);

  // Always subtract 15 minutes for intraday bars, 1 day for daily bars
  const safeEndUnix =
    granularity === "1Min" ? nowUnix - 60 * 15 : nowUnix - 60 * 60 * 24;

  // Keep your start logic flexible — you can set it however far back you want
  const startUnix =
    granularity === "1Min"
      ? safeEndUnix - 60 * 60 * 24 * 7 // e.g. 7 days of minute bars
      : safeEndUnix - 60 * 60 * 24 * 365; // e.g. 1 year of daily bars

  const startStr =
    granularity === "1Min"
      ? formatToRFC3339(startUnix)
      : formatToRFC3339(startUnix).slice(0, 10) + "T00:00:00Z";

  const endStr =
    granularity === "1Min"
      ? formatToRFC3339(safeEndUnix)
      : formatToRFC3339(safeEndUnix).slice(0, 10) + "T00:00:00Z";

  console.log(`Start and End Timestamps:`, startStr, endStr);

  return { timeframe, start: startStr, end: endStr };
};

const cache = isDev
  ? new Map<string, { data: any; timestamp: number }>()
  : null;

const TTL = 1000 * 60 * 5;
const MAX_CACHE_SIZE = 100;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get("ticker")?.toUpperCase() || "AAPL";
  const granularity = searchParams.get("timeframe") || "1D";

  const { timeframe, start, end } = getStartTime(granularity);

  const cacheKey = `${ticker}-${timeframe}-${start}-${end}`;
  const now = Date.now();

  if (isDev && cache) {
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < TTL) {
      console.log(`[Cache:DEV] Returning cached data for ${cacheKey}`);
      return NextResponse.json(cached.data, {
        headers: { "x-source": "cache-dev" },
      });
    }

    if (cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = [...cache.entries()].sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      )[0][0];
      cache.delete(oldestKey);
      console.log(`[Cache:DEV] Evicted oldest entry: ${oldestKey}`);
    }
  }

  // 🌐 Fetch from Alpaca
  const url = `${BASE_URL}?symbols=${ticker}&timeframe=${granularity}&start=${start}&end=${end}&limit=1000&adjustment=raw&feed=sip&sort=asc`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      "APCA-API-KEY-ID": ALPACA_API_KEY,
      "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
    },
    ...(isDev
      ? {}
      : {
          next: {
            revalidate: 300,
            tags: [`alpaca-${ticker}`],
          },
        }),
  });

  const raw = await res.json();

  if (!res.ok) {
    console.error(`[Fetch] Failed for ${ticker}: ${res.status}`);
    console.error(`[Fetch] Response body:`, raw);
    return NextResponse.json(
      { error: "Failed to fetch data", details: raw },
      { status: res.status }
    );
  }

  const bars = raw?.bars?.[ticker];
  if (!Array.isArray(bars)) {
    console.warn(`[Parse] Unexpected bars format for ${ticker}:`, raw);
  }

  const parsed = Array.isArray(bars)
    ? bars.map((bar: any) => ({
        time: bar.t,
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v,
      }))
    : [];

  if (isDev && cache) {
    cache.set(cacheKey, { data: parsed, timestamp: now });
    console.log(`[Cache:DEV] Stored ${cacheKey} with ${parsed.length} points`);
  }

  //! 🧠 Compute indicators
  // 🧠 Normalize timestamp for consistent matching
  //   const normalizeTime = (t: string | number) =>
  //     typeof t === "string"
  //       ? new Date(t).toISOString().slice(0, 19)
  //       : new Date(t * 1000).toISOString().slice(0, 19);

  //   // 🧠 Prepare series
  //   const parsed2 = bars.map((bar: any) => ({
  //     time: normalizeTime(bar.t),
  //     open: bar.o,
  //     high: bar.h,
  //     low: bar.l,
  //     close: bar.c,
  //     volume: bar.v,
  //   }));

  //   const closeSeries = parsed2.map((d) => ({
  //     time: d.time,
  //     value: d.close,
  //   }));
  //   const volumeSeries = parsed2.map((d) => ({
  //     time: d.time,
  //     value: d.close,
  //     volume: d.volume,
  //   }));

  //   // 🧠 Compute indicators
  //   const ema = computeEMA(closeSeries, 14);
  //   const rsi = computeRSI(closeSeries, 14);
  //   const obv = computeOBV(volumeSeries);
  //   const vwap = computeVWAP(volumeSeries);
  //   const bb = computeBollingerBands(closeSeries, 20, 2);

  //   // 🧠 Build lookup maps
  //   const emaMap = new Map(ema.map((d) => [d.time, d.value]));
  //   const rsiMap = new Map(rsi.map((d) => [d.time, d.value]));
  //   const obvMap = new Map(obv.map((d) => [d.time, d.value]));
  //   const vwapMap = new Map(vwap.map((d) => [d.time, d.value]));
  //   const bbMap = new Map(bb.map((d) => [d.time, d]));

  //   // 🧠 Enrich candles
  //   const enriched = parsed2.map((d) => ({
  //     ...d,
  //     ema: emaMap.get(d.time) ?? null,
  //     rsi: rsiMap.get(d.time) ?? null,
  //     obv: obvMap.get(d.time) ?? null,
  //     vwap: vwapMap.get(d.time) ?? null,
  //     bb_upper: bbMap.get(d.time)?.upper ?? null,
  //     bb_middle: bbMap.get(d.time)?.middle ?? null,
  //     bb_lower: bbMap.get(d.time)?.lower ?? null,
  //   }));

  //   // 📝 Export to CSV
  //   exportChartDataToCSV(enriched, `${ticker}_${granularity}_training.csv`);

  //   // 🧠 Cache enriched data
  //   if (isDev && cache) {
  //     cache.set(cacheKey, { data: enriched, timestamp: now });
  //     console.log(
  //       `[Cache:DEV] Stored ${cacheKey} with ${enriched.length} points`
  //     );
  //   }

  return NextResponse.json(parsed, {
    headers: { "x-source": isDev ? "fresh-dev" : "fresh-prod" },
  });
}
