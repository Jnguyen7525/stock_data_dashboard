// -------------------------------------------------------------
// This module converts raw trading bars into enriched bars with
// technical indicators and normalized features for ML pipelines.
// -------------------------------------------------------------

import {
  computeBollingerBands,
  computeEMA,
  computeOBV,
  computeRSI,
  computeVWAP,
} from "@/lib/indicators";

// -------------------------------------------------------------
// Raw bar format (input schema)
// -------------------------------------------------------------
export type RawBar = {
  start: string | number; // unix timestamp or ISO string
  open?: number;
  high?: number;
  low?: number;
  close: number;
  volume: number;
  ticker?: string; // optional ticker symbol (added from filename)
};

// -------------------------------------------------------------
// Enriched bar format (output schema)
// Includes raw + normalized features for ML
// -------------------------------------------------------------
export type EnrichedBar = {
  ticker?: string;
  time: string; // normalized ISO string
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema: number | null;
  rsi: number | null;
  obv: number | null;
  vwap: number | null;
  bb_upper: number | null;
  bb_middle: number | null;
  bb_lower: number | null;

  // Normalized versions (z-score scaling)
  open_norm?: number;
  high_norm?: number;
  low_norm?: number;
  close_norm?: number;
  volume_norm?: number;
  ema_norm?: number;
  rsi_norm?: number;
  obv_norm?: number;
  vwap_norm?: number;
  bb_upper_norm?: number;
  bb_middle_norm?: number;
  bb_lower_norm?: number;
};

// -------------------------------------------------------------
// Utility: Normalize timestamp into ISO string
// Handles unix seconds, milliseconds, or ISO strings.
// -------------------------------------------------------------
function normalizeTime(t: string | number): string {
  if (typeof t === "number") {
    const millis = t < 1e12 ? t * 1000 : t; // assume seconds if < 1e12
    return new Date(millis).toISOString().slice(0, 19);
  }
  const d = new Date(t);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid time value: ${t}`);
  }
  return d.toISOString().slice(0, 19);
}

// -------------------------------------------------------------
// Utility: Safely coerce to number
// Returns fallback if not finite.
// -------------------------------------------------------------
function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// -------------------------------------------------------------
// Utility: Z-score normalization
// Returns scaled values for a numeric array.
// -------------------------------------------------------------
function zScore(values: number[]): number[] {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
  );
  return values.map((v) => (v - mean) / (std || 1));
}

// -------------------------------------------------------------
// Main: Convert raw bars into enriched bars with indicators
// -------------------------------------------------------------
export function convertBars(rawBars: RawBar[]): EnrichedBar[] {
  if (!rawBars || rawBars.length === 0) {
    console.warn("[convertBars] No raw bars provided.");
    return [];
  }

  console.log(`[convertBars] Starting conversion for ${rawBars.length} bars.`);

  // Step 1: Normalize raw bars
  const parsed = rawBars.map((bar) => ({
    ticker: bar.ticker,
    time: normalizeTime(bar.start),
    open: toNumber(bar.open ?? bar.close),
    high: toNumber(bar.high ?? bar.close),
    low: toNumber(bar.low ?? bar.close),
    close: toNumber(bar.close),
    volume: toNumber(bar.volume),
  }));

  console.log("[convertBars] Parsed bars:", parsed.slice(0, 5));

  // Step 2: Sort bars oldest → newest
  parsed.sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );
  console.log("[convertBars] Bars sorted by time.");

  // Step 3: Prepare series for indicators
  const closeSeries = parsed.map((d) => ({ time: d.time, value: d.close }));
  const volumeSeries = parsed.map((d) => ({
    time: d.time,
    value: d.close,
    volume: d.volume,
  }));

  // Step 4: Compute indicators
  const ema = computeEMA(closeSeries, 14);
  const rsi = computeRSI(closeSeries, 14);
  const obv = computeOBV(volumeSeries);
  const vwap = computeVWAP(volumeSeries);
  const bb = computeBollingerBands(closeSeries, 20, 2);

  console.log("[convertBars] Indicators computed: EMA, RSI, OBV, VWAP, BB.");

  // Step 5: Build lookup maps for fast access
  const emaMap = new Map(ema.map((d) => [d.time, d.value]));
  const rsiMap = new Map(rsi.map((d) => [d.time, d.value]));
  const obvMap = new Map(obv.map((d) => [d.time, d.value]));
  const vwapMap = new Map(vwap.map((d) => [d.time, d.value]));
  const bbMap = new Map(bb.map((d) => [d.time, d]));

  // Step 6: Enrich candles with indicators
  const enriched: EnrichedBar[] = parsed.map((d) => ({
    ...d,
    ema: emaMap.get(d.time) ?? null,
    rsi: rsiMap.get(d.time) ?? null,
    obv: obvMap.get(d.time) ?? null,
    vwap: vwapMap.get(d.time) ?? null,
    bb_upper: bbMap.get(d.time)?.upper ?? null,
    bb_middle: bbMap.get(d.time)?.middle ?? null,
    bb_lower: bbMap.get(d.time)?.lower ?? null,
  }));

  console.log("[convertBars] Enriched bars with indicators.");

  // Step 7: Normalize features (z-score)
  const features: (keyof EnrichedBar)[] = [
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

  features.forEach((f) => {
    const vals = enriched.map((d) => (d[f] ?? 0) as number);
    const scaled = zScore(vals);
    enriched.forEach((d, i) => {
      (d as any)[`${f}_norm`] = scaled[i];
    });
  });

  console.log("[convertBars] Normalized features added (_norm fields).");

  return enriched;
}

// -------------------------------------------------------------
// Utility: Convert multiple files by merging, deduplicating, sorting
// -------------------------------------------------------------
export function convertMultipleFiles(files: RawBar[][]): EnrichedBar[] {
  console.log(`[convertMultipleFiles] Merging ${files.length} files.`);

  const allBars = files.flat();

  // Deduplicate by timestamp
  const uniqueMap = new Map<string, RawBar>();
  for (const bar of allBars) {
    const time = normalizeTime(bar.start);
    uniqueMap.set(time, bar);
  }

  const deduped = Array.from(uniqueMap.values());
  console.log(
    `[convertMultipleFiles] Deduplicated to ${deduped.length} unique bars.`
  );

  return convertBars(deduped);
}
