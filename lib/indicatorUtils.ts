export type TV = { time: number | string; value: number };

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

// Helper: zip values back to times, skipping NaN/undefined
export function zipToTimes(
  times: (number | string)[],
  values: (number | undefined)[]
): TV[] {
  const start = times.length - values.length;
  return values
    .map((v, i) =>
      v !== undefined && !isNaN(v) ? { time: times[start + i], value: v } : null
    )
    .filter((d): d is TV => !!d);
}

// Helper: zip MACD outputs
export function zipMACD(times: (number | string)[], outputs: any[]) {
  const start = times.length - outputs.length;
  return {
    macd: outputs
      .map((o, i) =>
        o.MACD !== undefined && !isNaN(o.MACD)
          ? { time: times[start + i], value: o.MACD }
          : null
      )
      .filter(Boolean) as TV[],
    signal: outputs
      .map((o, i) =>
        o.signal !== undefined && !isNaN(o.signal)
          ? { time: times[start + i], value: o.signal }
          : null
      )
      .filter(Boolean) as TV[],
    histogram: outputs
      .map((o, i) =>
        o.histogram !== undefined && !isNaN(o.histogram)
          ? { time: times[start + i], value: o.histogram }
          : null
      )
      .filter(Boolean) as TV[],
  };
}

// Helper: zip Bollinger Bands outputs
export function zipBB(times: (number | string)[], outputs: any[]) {
  const start = times.length - outputs.length;
  return {
    upper: outputs
      .map((o, i) =>
        o.upper !== undefined && !isNaN(o.upper)
          ? { time: times[start + i], value: o.upper }
          : null
      )
      .filter(Boolean) as TV[],
    middle: outputs
      .map((o, i) =>
        o.middle !== undefined && !isNaN(o.middle)
          ? { time: times[start + i], value: o.middle }
          : null
      )
      .filter(Boolean) as TV[],
    lower: outputs
      .map((o, i) =>
        o.lower !== undefined && !isNaN(o.lower)
          ? { time: times[start + i], value: o.lower }
          : null
      )
      .filter(Boolean) as TV[],
  };
}
