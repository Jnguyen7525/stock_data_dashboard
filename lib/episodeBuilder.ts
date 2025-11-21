// -------------------------------------------------------------
// Episode builder: groups bars into episodes using zig-zag swings
// -------------------------------------------------------------

export type RawRow = {
  ticker: string;
  time: string;
  open: number;
  open_norm?: number;
  high: number;
  low: number;
  close: number;
  close_norm?: number;
  volume: number;
  volume_norm?: number;
  ema?: number | null;
  ema_norm?: number | null;
  rsi?: number | null;
  rsi_norm?: number | null;
  obv?: number | null;
  obv_norm?: number | null;
  vwap?: number | null;
  vwap_norm?: number | null;
  bb_upper?: number | null;
  bb_upper_norm?: number | null;
  bb_middle?: number | null;
  bb_middle_norm?: number | null;
  bb_lower?: number | null;
  bb_lower_norm?: number | null;
};

export type Episode = {
  ticker: string;
  episode_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  direction: "up" | "down" | "flat";
  total_return: number;

  // Linear regression features
  lr_slope_5: number;
  lr_slope_5_norm: number;
  lr_fit_r2_5: number; // 🔹 new field
  trend_dir: string;
  trend_quality: "strong" | "weak"; // ✅ add this

  // Snapshots
  start_features: RawRow;
  end_features: RawRow;

  // Aggregates (raw + normalized)
  avg_volume: number;
  avg_volume_norm: number;
  max_volume: number;
  avg_rsi: number | null;
  avg_rsi_norm: number | null;
  avg_volatility: number;
  avg_volatility_norm: number;
  obv_change: number | null;
  obv_change_norm: number | null;
  avg_vwap: number | null;
  avg_vwap_norm: number | null;

  // Explicit start/end values (raw + normalized)
  price_start: number;
  price_end: number;
  price_delta: number;
  price_start_norm?: number | null;
  price_end_norm?: number | null;
  rsi_start?: number | null;
  rsi_end?: number | null;
  rsi_start_norm?: number | null;
  rsi_end_norm?: number | null;
  vwap_start?: number | null;
  vwap_end?: number | null;
  vwap_start_norm?: number | null;
  vwap_end_norm?: number | null;
  obv_start?: number | null;
  obv_end?: number | null;
  obv_start_norm?: number | null;
  obv_end_norm?: number | null;
  ema_start?: number | null;
  ema_end?: number | null;
  ema_start_norm?: number | null;
  ema_end_norm?: number | null;
};

// -------------------------------------------------------------
// Helper: linear regression slope
// -------------------------------------------------------------
function lrSlopeAndR2(values: number[]): { slope: number; r2: number } {
  const n = values.length;
  if (n === 0) return { slope: 0, r2: 0 };

  const x = [...Array(n).keys()];
  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  let num = 0,
    den = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - xMean) * (values[i] - yMean);
    den += (x[i] - xMean) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;

  // Compute intercept
  const intercept = yMean - slope * xMean;

  // Compute R²
  const ssTot = values.reduce((sum, y) => sum + (y - yMean) ** 2, 0);
  const ssRes = values.reduce((sum, y, i) => {
    const yPred = slope * x[i] + intercept;
    return sum + (y - yPred) ** 2;
  }, 0);
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, r2 };
}

// -------------------------------------------------------------
// Build episodes using zig-zag swing detection
// -------------------------------------------------------------
export function buildEpisodes(
  rows: RawRow[],
  reversalThresholdPct = 0.05
): Episode[] {
  const episodes: Episode[] = [];
  if (rows.length === 0) return episodes;

  console.log(
    `[buildEpisodes] Starting with ${rows.length} rows, threshold=${reversalThresholdPct}`
  );

  // Detect swing points
  let swings: { idx: number; price: number; type: "peak" | "trough" }[] = [];
  let lastIdx = 0;
  let lastPrice = rows[0].close;
  let direction: "up" | "down" | null = null;

  for (let i = 1; i < rows.length; i++) {
    const change = (rows[i].close - lastPrice) / lastPrice;
    if (direction === null) {
      if (Math.abs(change) >= reversalThresholdPct) {
        direction = change > 0 ? "up" : "down";
        lastIdx = i;
        lastPrice = rows[i].close;
      }
      continue;
    }
    const rev = (rows[i].close - lastPrice) / lastPrice;
    if (direction === "up" && rev <= -reversalThresholdPct) {
      swings.push({ idx: lastIdx, price: lastPrice, type: "peak" });
      direction = "down";
      lastIdx = i;
      lastPrice = rows[i].close;
    } else if (direction === "down" && rev >= reversalThresholdPct) {
      swings.push({ idx: lastIdx, price: lastPrice, type: "trough" });
      direction = "up";
      lastIdx = i;
      lastPrice = rows[i].close;
    } else {
      if (direction === "up" && rows[i].close > lastPrice) {
        lastIdx = i;
        lastPrice = rows[i].close;
      }
      if (direction === "down" && rows[i].close < lastPrice) {
        lastIdx = i;
        lastPrice = rows[i].close;
      }
    }
  }
  swings.push({
    idx: lastIdx,
    price: lastPrice,
    type: direction === "up" ? "peak" : "trough",
  });

  console.log(`[buildEpisodes] Found ${swings.length} swing points.`);

  // Build episodes between swings
  for (let k = 0; k < swings.length - 1; k++) {
    const a = swings[k];
    const b = swings[k + 1];
    const start = rows[a.idx];
    const exit = rows[b.idx];
    const segmentRows = rows.slice(a.idx, b.idx + 1);
    if (segmentRows.length === 0) continue;

    const duration = b.idx - a.idx + 1;
    const totalReturn = exit.close / start.close - 1;
    const dir: "up" | "down" | "flat" =
      exit.close > start.close
        ? "up"
        : exit.close < start.close
        ? "down"
        : "flat";

    // Aggregates (raw + normalized)
    const avgVol =
      segmentRows.reduce((sum, r) => sum + r.volume, 0) / segmentRows.length;
    const avgVolNorm =
      segmentRows.reduce((sum, r) => sum + (r.volume_norm ?? 0), 0) /
      segmentRows.length;
    const maxVol = Math.max(...segmentRows.map((r) => r.volume));

    const rsis = segmentRows
      .map((r) => r.rsi)
      .filter((r): r is number => r != null);
    const avgRsi = rsis.length
      ? rsis.reduce((a, b) => a + b, 0) / rsis.length
      : null;
    const avgRsiNorm = segmentRows
      .map((r) => r.rsi_norm)
      .filter((v): v is number => v != null);
    const avgRsiNormVal = avgRsiNorm.length
      ? avgRsiNorm.reduce((a, b) => a + b, 0) / avgRsiNorm.length
      : null;

    const volatilities = segmentRows.map((r) => (r.high - r.low) / r.close);
    const avgVolatility =
      volatilities.reduce((a, b) => a + b, 0) / volatilities.length;
    const avgVolatilityNorm =
      segmentRows.reduce((sum, r) => {
        const denom = r.close_norm ?? 0;
        return sum + (denom !== 0 ? (r.high - r.low) / denom : 0);
      }, 0) / segmentRows.length;

    const obvChange = (exit.obv ?? 0) - (start.obv ?? 0);
    const obvChangeNorm = (exit.obv_norm ?? 0) - (start.obv_norm ?? 0);

    const vwaps = segmentRows
      .map((r) => r.vwap)
      .filter((v): v is number => v != null);
    const avgVwap = vwaps.length
      ? vwaps.reduce((a, b) => a + b, 0) / vwaps.length
      : null;
    const avgVwapNorm = segmentRows
      .map((r) => r.vwap_norm)
      .filter((v): v is number => v != null);
    const avgVwapNormVal = avgVwapNorm.length
      ? avgVwapNorm.reduce((a, b) => a + b, 0) / avgVwapNorm.length
      : null;

    // Linear regression slope + fit quality
    const { slope, r2 } = lrSlopeAndR2(segmentRows.map((r) => r.close));
    const slopeNorm = slope / (start.close || 1);

    const episode: Episode = {
      ticker: start.ticker,
      episode_id: `${start.ticker}_${start.time}_${exit.time}`,
      start_time: start.time,
      end_time: exit.time,
      duration,
      direction: dir,
      total_return: totalReturn,

      lr_slope_5: slope,
      lr_slope_5_norm: slopeNorm,
      lr_fit_r2_5: r2,
      trend_dir: dir,
      trend_quality: r2 > 0.7 ? "strong" : "weak",

      start_features: start,
      end_features: exit,

      avg_volume: avgVol,
      avg_volume_norm: avgVolNorm,
      max_volume: maxVol,
      avg_rsi: avgRsi,
      avg_rsi_norm: avgRsiNormVal,
      avg_volatility: avgVolatility,
      avg_volatility_norm: avgVolatilityNorm,
      obv_change: obvChange,
      obv_change_norm: obvChangeNorm,
      avg_vwap: avgVwap,
      avg_vwap_norm: avgVwapNormVal,

      price_start: start.close,
      price_end: exit.close,
      price_delta: exit.close - start.close,
      price_start_norm: start.close_norm ?? null,
      price_end_norm: exit.close_norm ?? null,
      rsi_start: start.rsi ?? null,
      rsi_end: exit.rsi ?? null,
      rsi_start_norm: start.rsi_norm ?? null,
      rsi_end_norm: exit.rsi_norm ?? null,
      vwap_start: start.vwap ?? null,
      vwap_end: exit.vwap ?? null,
      vwap_start_norm: start.vwap_norm ?? null,
      vwap_end_norm: exit.vwap_norm ?? null,
      obv_start: start.obv ?? null,
      obv_end: exit.obv ?? null,
      obv_start_norm: start.obv_norm ?? null,
      obv_end_norm: exit.obv_norm ?? null,
      ema_start: start.ema ?? null,
      ema_end: exit.ema ?? null,
      ema_start_norm: start.ema_norm ?? null,
      ema_end_norm: exit.ema_norm ?? null,
    };

    // Trend quality flag
    // (episode as any).trend_quality = r2 > 0.7 ? "strong" : "weak";

    console.log(
      `[buildEpisodes] Episode ${episode.episode_id}: dir=${
        episode.direction
      }, return=${episode.total_return.toFixed(
        4
      )}, slope=${episode.lr_slope_5.toFixed(
        4
      )}, R²=${episode.lr_fit_r2_5.toFixed(3)}, duration=${episode.duration}`
    );
    episodes.push(episode);
  }

  // Aggregate summary logging
  const upCount = episodes.filter((e) => e.direction === "up").length;
  const downCount = episodes.filter((e) => e.direction === "down").length;
  const flatCount = episodes.filter((e) => e.direction === "flat").length;
  const avgReturn =
    episodes.reduce((s, e) => s + e.total_return, 0) / (episodes.length || 1);
  console.log(
    `[buildEpisodes] Built ${
      episodes.length
    } episodes. up=${upCount}, down=${downCount}, flat=${flatCount}, avgReturn=${avgReturn.toFixed(
      4
    )}`
  );

  return episodes;
}
