export type ChartPoint = { time: string | number; value: number };
// Base OHLC bar type
type BarData = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  date?: string;
  value?: number;
};

// Normalize raw OHLC data into close-price series
export function normalizeCloseSeries(data: BarData[]): ChartPoint[] {
  return data
    .map((d) => {
      const time = d.time || d.date?.slice(0, 10);
      const value = typeof d.close === "number" ? d.close : d.value;
      return typeof value === "number" ? { time, value } : null;
    })
    .filter((d): d is ChartPoint => !!d);
}

// Filter out invalid values for charting
export function filterValidPoints(data: ChartPoint[]): ChartPoint[] {
  return data.filter(
    (point) =>
      point &&
      typeof point.value === "number" &&
      !isNaN(point.value) &&
      Math.abs(point.value) < 9e15
  );
}

// Simple Moving Average
export function computeSMA(data: ChartPoint[], period: number): ChartPoint[] {
  const result: ChartPoint[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const avg = slice.reduce((sum, d) => sum + d.value, 0) / period;
    result.push({ time: data[i].time, value: avg });
  }
  return result;
}

// Exponential Moving Average
export function computeEMA(data: ChartPoint[], period: number): ChartPoint[] {
  const result: ChartPoint[] = [];
  const k = 2 / (period + 1);
  let emaPrev =
    data.slice(0, period).reduce((sum, d) => sum + d.value, 0) / period;

  for (let i = period; i < data.length; i++) {
    const ema = data[i].value * k + emaPrev * (1 - k);
    result.push({ time: data[i].time, value: ema });
    emaPrev = ema;
  }

  return result;
}

export function computeBollingerBands(
  data: ChartPoint[],
  period = 20,
  multiplier = 2
) {
  const result: {
    time: string;
    upper: number;
    middle: number;
    lower: number;
  }[] = [];

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = slice.reduce((sum, d) => sum + d.value, 0) / period;
    const variance =
      slice.reduce((sum, d) => sum + Math.pow(d.value - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    result.push({
      time: data[i].time as string,
      middle: mean,
      upper: mean + multiplier * stdDev,
      lower: mean - multiplier * stdDev,
    });
  }

  return result;
}

// Weighted Moving Average
export function computeWMA(data: ChartPoint[], period: number): ChartPoint[] {
  const result: ChartPoint[] = [];
  const denominator = (period * (period + 1)) / 2;

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const weightedSum = slice.reduce(
      (sum, d, idx) => sum + d.value * (idx + 1),
      0
    );
    result.push({ time: data[i].time, value: weightedSum / denominator });
  }

  return result;
}

export function computeVWAP(
  data: { time: string; value: number; volume: number }[]
): ChartPoint[] {
  const result: ChartPoint[] = [];
  let cumulativePV = 0;
  let cumulativeVolume = 0;

  for (const point of data) {
    if (typeof point.value !== "number" || typeof point.volume !== "number")
      continue;

    cumulativePV += point.value * point.volume;
    cumulativeVolume += point.volume;

    const vwap = cumulativePV / cumulativeVolume;
    result.push({ time: point.time, value: vwap });
  }

  return result;
}

export function computeOBV(
  data: { time: string; value: number; volume: number }[]
) {
  const result: ChartPoint[] = [];
  let obv = 0;

  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];

    if (curr.value > prev.value) obv += curr.volume;
    else if (curr.value < prev.value) obv -= curr.volume;

    result.push({ time: curr.time, value: obv });
  }

  return result;
}

// Relative Strength Index
export function computeRSI(data: ChartPoint[], period: number): ChartPoint[] {
  const result: ChartPoint[] = [];
  for (let i = period; i < data.length; i++) {
    const slice = data.slice(i - period, i + 1);
    let gains = 0,
      losses = 0;
    for (let j = 1; j < slice.length; j++) {
      const diff = slice[j].value - slice[j - 1].value;
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    const rs = gains / (losses || 1);
    const rsi = 100 - 100 / (1 + rs);
    result.push({ time: data[i].time, value: rsi });
  }
  return result;
}

export function computeMACD(data: ChartPoint[]) {
  const ema12 = computeEMA(data, 12);
  const ema26 = computeEMA(data, 26);
  const macd: ChartPoint[] = [];

  for (let i = 0; i < ema26.length; i++) {
    const time = ema26[i].time;
    const value =
      ema12[i + (ema12.length - ema26.length)].value - ema26[i].value;
    macd.push({ time, value });
  }

  const signal = computeEMA(macd, 9);
  const histogram: ChartPoint[] = [];

  for (let i = 0; i < signal.length; i++) {
    const time = signal[i].time;
    const value =
      macd[i + (macd.length - signal.length)].value - signal[i].value;
    histogram.push({ time, value });
  }

  return { macd, signal, histogram };
}
