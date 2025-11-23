import * as tf from "@tensorflow/tfjs";

// ---------- Episode type ----------
export type EpisodeRow = {
  ticker: string;
  episode_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  direction: "up" | "down" | "flat";
  total_return: number;
  lr_slope_5: number;
  lr_slope_5_norm: number;
  lr_fit_r2_5: number;
  trend_quality: "strong" | "weak";
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
  price_start: number;
  price_end: number;
  price_delta: number;
  price_start_norm: number | null;
  price_end_norm: number | null;
  rsi_start: number | null;
  rsi_end: number | null;
  rsi_start_norm: number | null;
  rsi_end_norm: number | null;
  vwap_start: number | null;
  vwap_end: number | null;
  vwap_start_norm: number | null;
  vwap_end_norm: number | null;
  obv_start: number | null;
  obv_end: number | null;
  obv_start_norm: number | null;
  obv_end_norm: number | null;
  ema_start: number | null;
  ema_end: number | null;
  ema_start_norm: number | null;
  ema_end_norm: number | null;
};

// ---------- Missing value handling ----------
export type ImputeStrategy = "zero" | "mean" | "sentinel" | "median";

/**
 * Impute missing values according to chosen strategy.
 */
function imputeValue(
  v: number | null | undefined,
  strategy: ImputeStrategy,
  mean?: number,
  median?: number
): number {
  if (v == null || Number.isNaN(v)) {
    switch (strategy) {
      case "zero":
        return 0;
      case "mean":
        return mean ?? 0;
      case "median":
        return median ?? 0;
      case "sentinel":
        return -1;
    }
  }
  return Number(v);
}

// ---------- Feature selection ----------
export const FEATURES = [
  "duration",
  "total_return",
  "lr_slope_5",
  "lr_slope_5_norm",
  "lr_fit_r2_5",
  "avg_volume",
  "avg_volume_norm",
  "max_volume",
  "avg_rsi",
  "avg_rsi_norm",
  "avg_volatility",
  "avg_volatility_norm",
  "obv_change",
  "obv_change_norm",
  "avg_vwap",
  "avg_vwap_norm",
  "price_start",
  "price_end",
  "price_delta",
  "price_start_norm",
  "price_end_norm",
  "rsi_start",
  "rsi_end",
  "rsi_start_norm",
  "rsi_end_norm",
  "vwap_start",
  "vwap_end",
  "vwap_start_norm",
  "vwap_end_norm",
  "obv_start",
  "obv_end",
  "obv_start_norm",
  "obv_end_norm",
  "ema_start",
  "ema_end",
  "ema_start_norm",
  "ema_end_norm",
] as const;

type FeatureName = (typeof FEATURES)[number];

// ---------- Feature vector builder ----------
export function rowToFeatureVector(
  row: EpisodeRow,
  strategy: ImputeStrategy,
  featureMeans?: Record<string, number>,
  featureMedians?: Record<string, number>,
  verbose = false
): Float32Array {
  if (verbose) console.log(`[rowToFeatureVector] episode=${row.episode_id}`);
  const base: number[] = FEATURES.map((f: FeatureName) =>
    imputeValue(
      (row as any)[f],
      strategy,
      featureMeans?.[f],
      featureMedians?.[f]
    )
  );
  return new Float32Array(base);
}

// ---------- Label extraction ----------
export function rowToDirectionLabel(
  row: EpisodeRow,
  verbose = false
): number[] {
  const label = [
    row.direction === "up" ? 1 : 0,
    row.direction === "down" ? 1 : 0,
    row.direction === "flat" ? 1 : 0,
  ];
  if (verbose)
    console.log(`[rowToDirectionLabel] ${row.episode_id} → ${label}`);
  return label;
}

export function rowToTrendQualityLabel(
  row: EpisodeRow,
  verbose = false
): number[] {
  const label = [
    row.trend_quality === "strong" ? 1 : 0,
    row.trend_quality === "weak" ? 1 : 0,
  ];
  if (verbose)
    console.log(`[rowToTrendQualityLabel] ${row.episode_id} → ${label}`);
  return label;
}

export function rowToCompositeLabel(row: EpisodeRow): string {
  return `${row.direction}_${row.trend_quality}`;
}

// ---------- Diagnostics ----------
export function logMissingValues(rows: EpisodeRow[]) {
  FEATURES.forEach((f) => {
    const missing = rows.filter((r) => (r as any)[f] == null).length;
    if (missing > 0) {
      console.warn(
        `[logMissingValues] Feature ${f} missing in ${missing}/${rows.length} episodes`
      );
    }
  });
}

// ---------- StandardScaler ----------
export class StandardScaler {
  means: Float32Array | null = null;
  stds: Float32Array | null = null;

  fit(X: tf.Tensor2D) {
    console.log("[StandardScaler] Fitting scaler...");
    const { mean, variance } = tf.moments(X, 0);
    this.means = mean.dataSync() as Float32Array;
    const varData = variance.dataSync() as Float32Array;
    this.stds = new Float32Array(varData.length);
    for (let i = 0; i < varData.length; i++) {
      const s = Math.sqrt(varData[i]);
      this.stds[i] = s === 0 ? 1 : s;
    }
    mean.dispose();
    variance.dispose();
    console.log("[StandardScaler] Means:", this.means);
    console.log("[StandardScaler] Stds:", this.stds);
  }

  transform(X: tf.Tensor2D): tf.Tensor2D {
    // if (!this.means || !this.stds) throw new Error("Scaler not fitted");
    if (!this.means || !this.stds) {
      throw new Error("Scaler not fitted");
    }

    // Guard: empty input
    if (X.shape[0] === 0 || X.shape[1] === 0) {
      console.warn("[StandardScaler] Empty input tensor, skipping transform");
      return X;
    }

    // Guard: feature mismatch
    if (X.shape[1] !== this.means.length) {
      throw new Error(
        `[StandardScaler] Feature mismatch: expected ${this.means.length}, got ${X.shape[1]}`
      );
    }

    const meansT = tf.tensor1d(Array.from(this.means));
    const stdsT = tf.tensor1d(Array.from(this.stds));
    const Xc = tf.sub(X, meansT);
    const Xn = tf.div(Xc, stdsT);
    meansT.dispose();
    stdsT.dispose();
    Xc.dispose();
    console.log("[StandardScaler] Transform complete");
    return Xn as tf.Tensor2D;
  }

  toJSON() {
    return {
      means: Array.from(this.means || []),
      stds: Array.from(this.stds || []),
    };
  }

  static fromJSON(obj: { means: number[]; stds: number[] }) {
    const s = new StandardScaler();
    s.means = new Float32Array(obj.means);
    s.stds = new Float32Array(obj.stds);
    return s;
  }
}

// ---------- Build feature tensor ----------
export function buildFeatureTensor(
  rows: EpisodeRow[],
  strategy: ImputeStrategy = "sentinel"
) {
  console.log(
    `[buildFeatureTensor] Building tensor for ${rows.length} episodes`
  );
  if (rows.length === 0) {
    console.warn(
      "[buildFeatureTensor] No rows provided, returning empty tensor"
    );
    return tf.tensor2d([], [0, FEATURES.length], "float32");
  }

  const vectors = rows.map((row) => rowToFeatureVector(row, strategy));
  const d = vectors[0]?.length || 0;
  const flat = new Float32Array(rows.length * d);
  vectors.forEach((v, i) => flat.set(v, i * d));
  const X = tf.tensor2d(flat, [rows.length, d], "float32");
  console.log(`[buildFeatureTensor] Shape: [${X.shape[0]}, ${X.shape[1]}]`);
  return X;
}
