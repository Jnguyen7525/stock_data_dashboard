"use client";

import {
  LineSeries,
  HistogramSeries,
  createSeriesMarkers,
  LineData,
  Time,
  WhitespaceData,
  LineStyle,
  IChartApi,
} from "lightweight-charts";

import { getEpisodePredictions } from "@/hooks/useEpisodeFeatures";
import { RawRow } from "@/lib/episodeBuilder";

import {
  filterValidPoints,
  normalizeCloseSeries,
  TV,
  zipBB,
  zipMACD,
  zipToTimes,
} from "@/lib/indicatorUtils";
import {
  adl,
  atr,
  bollingerbands,
  cci,
  dpo,
  ema,
  forceindex,
  kst,
  macd,
  mfi,
  obv,
  pivotpoints,
  ppo,
  priceoscillator,
  psar,
  roc,
  rsi,
  sma,
  stochastic,
  stochasticrsi,
  trix,
  ultimateoscillator,
  vwap,
  wema,
  williamsr,
  wma,
  adx,
  aroon,
  aroonoscillator,
  chandelierexit,
  donchianchannels,
  ichimokucloud,
  keltnerchannels,
  linearregression,
  maenvelope,
  minusdm,
  plusdm,
  supertrend,
  truerange,
  volatilityindex,
  awesomeoscillator,
  doji,
  bullishengulfingpattern,
  bearishengulfingpattern,
  hammer,
  hangingman,
  shootingstar,
  spinningtop,
  marubozu,
  dragonflydoji,
  gravestonedoji,
  threewhitesoldiers,
  threeblackcrows,
  bullishharami,
  bearishharami,
  piercingline,
  darkcloudcover,
  morningstar,
  eveningstar,
  tweezerbottom,
  tweezertop,
  abandonedbaby,
  bullishmarubozu,
  bearishmarubozu,
  bullishinvertedhammer,
  bearishinvertedhammer,
  morningdojistar,
  eveningdojistar,
  downsidetasukigap,
  bullishspinningtop,
  bearishspinningtop,
  bullishhammerstick,
  bearishhammerstick,
  bullishharamicross,
  bearishharamicross,
  hammerpatternunconfirmed,
  hangingmanunconfirmed,
  shootingstarunconfirmed,
} from "@/lib/indicators/index";
import { RefObject } from "react";

//! 1️⃣ Pattern detectors mapping
export const patternDetectors: Record<
  string,
  (args: { candles: any[] }) => boolean[]
> = {
  Doji: doji,
  "Bullish Engulfing": bullishengulfingpattern,
  "Bearish Engulfing": bearishengulfingpattern,
  Hammer: hammer,
  "Hanging Man": hangingman,
  "Shooting Star": shootingstar,
  "Spinning Top": spinningtop,
  Marubozu: marubozu,
  "Dragonfly Doji": dragonflydoji,
  "Gravestone Doji": gravestonedoji,
  "Three White Soldiers": threewhitesoldiers,
  "Three Black Crows": threeblackcrows,
  "Bullish Harami": bullishharami,
  "Bearish Harami": bearishharami,
  "Piercing Line": piercingline,
  "Dark Cloud Cover": darkcloudcover,
  "Morning Star": morningstar,
  "Evening Star": eveningstar,
  "Tweezer Bottom": tweezerbottom,
  "Tweezer Top": tweezertop,
  "Abandoned Baby": abandonedbaby,
  "Bullish Marubozu": bullishmarubozu,
  "Bearish Marubozu": bearishmarubozu,
  "Bullish Inverted Hammer": bullishinvertedhammer,
  "Bearish Inverted Hammer": bearishinvertedhammer,
  "Morning Doji Star": morningdojistar,
  "Evening Doji Star": eveningdojistar,
  "Downside Tasuki Gap": downsidetasukigap,
  "Bullish Spinning Top": bullishspinningtop,
  "Bearish Spinning Top": bearishspinningtop,
  "Bullish Hammer Stick": bullishhammerstick,
  "Bearish Hammer Stick": bearishhammerstick,
  "Bullish Harami Cross": bullishharamicross,
  "Bearish Harami Cross": bearishharamicross,
  "Hammer Pattern (Unconfirmed)": hammerpatternunconfirmed,
  "Hanging Man (Unconfirmed)": hangingmanunconfirmed,
  "Shooting Star (Unconfirmed)": shootingstarunconfirmed,
};

export const addLine = (
  key: string,
  data: any[],
  color: string,
  paneIndex = 0,
  chartRef?: RefObject<IChartApi | null>,
  isChartReady?: boolean,
  overlayRefs?: RefObject<Record<string, any>>
) => {
  if (!chartRef?.current || !isChartReady) return;
  const chart = chartRef!.current;
  const safe = filterValidPoints(data);
  if (safe.length === 0) return;

  let series;

  switch (key) {
    // --- Dots (PSAR)
    case "PSAR": {
      series = chart.addSeries(
        LineSeries,
        {
          color,
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
        },
        paneIndex
      );

      // Each SAR value becomes a short horizontal segment
      series.setData(
        safe.map(
          (p) =>
            ({
              time: p.time,
              value: p.value,
            }) as unknown as LineData<Time> | WhitespaceData<Time>
        )
      );

      overlayRefs!.current["PSAR"] = series;
      break;
    }

    // --- MACD / PPO (lines + histogram)
    case "MACD_Line":
    case "PPO_Line":
    case "MACD_Signal":
    case "PPO_Signal":
      series = chart.addSeries(LineSeries, { color, lineWidth: 2 }, paneIndex);
      series.setData(
        safe as unknown as (LineData<Time> | WhitespaceData<Time>)[]
      );
      break;
    case "MACD_Histogram":
    case "PPO_Histogram":
      series = chart.addSeries(HistogramSeries, { color }, paneIndex);
      series.setData(
        safe.map(
          (p) =>
            ({
              time: p.time,
              value: p.value,
              color: p.value >= 0 ? "#26a69a" : "#ef5350", // green/red bars
            }) as unknown as LineData<Time> | WhitespaceData<Time>
        )
      );
      break;

    // --- Awesome Oscillator (histogram)
    case "AwesomeOsc":
      series = chart.addSeries(HistogramSeries, {}, paneIndex);
      series.setData(
        safe.map(
          (p) =>
            ({
              time: p.time,
              value: p.value,
              color: p.value >= 0 ? "#00cc00" : "#cc0000",
            }) as unknown as LineData<Time> | WhitespaceData<Time>
        )
      );
      break;

    // --- Pivot Points (horizontal levels)
    case "PivotPoints": {
      series = chart.addSeries(
        LineSeries,
        {
          color,
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
        },
        paneIndex
      );

      // Pivot points are flat levels, so repeat the same value across times
      series.setData(
        safe.map(
          (p) =>
            ({
              time: p.time,
              value: p.value,
            }) as unknown as LineData<Time> | WhitespaceData<Time>
        )
      );

      overlayRefs!.current["PivotPoints"] = series;
      break;
    }

    // --- Default: line series
    default:
      series = chart.addSeries(LineSeries, { color, lineWidth: 2 }, paneIndex);
      series.setData(
        safe as unknown as (LineData<Time> | WhitespaceData<Time>)[]
      );

      break;
  }

  overlayRefs!.current[key] = series;
  return series;
};

export const updateMLOverlays = (
  chartRef: RefObject<IChartApi | null>,
  isChartReady: boolean,
  overlayRefs: RefObject<Record<string, any>>,
  seriesRef: RefObject<any>,
  filteredEpisodes: any[]
) => {
  const chart = chartRef.current;
  if (!chart || !isChartReady) return;
  // Clear old overlays if needed
  Object.keys(overlayRefs.current)
    .filter((key) => key.startsWith("ML Dashed"))
    .forEach((key) => {
      overlayRefs.current[key].setData([]); // clear series
      delete overlayRefs.current[key];
    });

  const markers: any[] = [];
  const regimeColorMap: Record<string, string> = {
    Up: "#00cc66",
    Down: "#cc0000",
    Flat: "#999999",
  };

  filteredEpisodes.forEach((ep, idx) => {
    const labelStr = ep.label;
    const regimeColor = regimeColorMap[labelStr] ?? "#888888";

    const startTime = new Date(ep.episode.start_time).getTime() / 1000;
    const endTime = new Date(ep.episode.end_time).getTime() / 1000;

    const startValue = ep.episode.price_start;
    const endValue = ep.episode.price_end;

    // dashed line overlay
    const dashedLineSeries = chart.addSeries(
      LineSeries,
      {
        color: regimeColor,
        lineWidth: 2,
        lineStyle: 1,
      },
      0
    );

    dashedLineSeries.setData([
      { time: startTime as Time, value: startValue },
      { time: endTime as Time, value: endValue },
    ]);

    overlayRefs.current[`ML Dashed ${idx}`] = dashedLineSeries;

    // markers
    markers.push({
      time: startTime,
      position: "belowBar",
      color: regimeColor,
      shape: "arrowUp",
      text: `Start: ${labelStr}`,
    });
    markers.push({
      time: endTime,
      position: "aboveBar",
      color: regimeColor,
      shape: "arrowDown",
      text: `End: ${labelStr} | ${ep.episode.duration} bars | Conf ${(ep.confidence * 100).toFixed(1)}%`,
    });
  });

  // apply markers
  const markerPrimitive = createSeriesMarkers(seriesRef.current, markers);
  overlayRefs.current["MLMarkers"] = markerPrimitive;
};

export async function runMLPredictionOverlay(
  data: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[],
  ticker: string,
  model: any,
  scaler: any,
  labels: any,
  showTrends: boolean,
  overlayRefs: React.MutableRefObject<Record<string, any>>,
  updateMLOverlays: (episodes: any[]) => void
) {
  // Bail early if disabled or missing model/scaler
  if (!showTrends || !model || !scaler) {
    const markerPrimitive = overlayRefs.current["MLMarkers"];
    if (markerPrimitive) {
      markerPrimitive.setMarkers([]);
      delete overlayRefs.current["MLMarkers"];
    }
    return;
  }

  // 1️⃣ Prepare base OHLCV arrays
  const times = data.map((d) => d.time);
  const closes = data.map((d) => d.close);
  const highs = data.map((d) => d.high);
  const lows = data.map((d) => d.low);
  const volumes = data.map((d) => d.volume);

  // 2️⃣ Compute indicators
  const rsiOut = rsi({ period: 14, values: closes });
  const emaOut = ema({ period: 14, values: closes });
  const bbOut = bollingerbands({ period: 20, values: closes, stdDev: 2 });
  const vwapOut = vwap({
    high: highs,
    low: lows,
    close: closes,
    volume: volumes,
  });
  const obvOut = obv({ close: closes, volume: volumes });

  // 3️⃣ Index results by time
  const idx = <T extends { time: number | string }>(arr: T[]) =>
    arr.reduce((m, x) => (m.set(x.time, x), m), new Map<number | string, T>());

  const rsiSeries = zipToTimes(times, rsiOut);
  const emaSeries = zipToTimes(times, emaOut);
  const obvSeries = zipToTimes(times, obvOut);
  const vwapSeries = zipToTimes(times, vwapOut);
  const { upper, middle, lower } = zipBB(times, bbOut);

  const rsiMap = idx(rsiSeries);
  const emaMap = idx(emaSeries);
  const obvMap = idx(obvSeries);
  const vwapMap = idx(vwapSeries);
  const bbUpperMap = idx(upper);
  const bbMiddleMap = idx(middle);
  const bbLowerMap = idx(lower);

  // 4️⃣ Enrich bars with indicator values
  const enrichedBars: RawRow[] = data.map((d) => ({
    ticker,
    time: new Date(d.time * 1000).toISOString(),
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
    volume: d.volume,
    ema: emaMap.get(d.time)?.value ?? null,
    rsi: rsiMap.get(d.time)?.value ?? null,
    obv: obvMap.get(d.time)?.value ?? null,
    vwap: vwapMap.get(d.time)?.value ?? null,
    bb_upper: bbUpperMap.get(d.time)?.value ?? null,
    bb_middle: bbMiddleMap.get(d.time)?.value ?? null,
    bb_lower: bbLowerMap.get(d.time)?.value ?? null,
  }));

  // 5️⃣ Run ML predictions
  const episodes = await getEpisodePredictions(
    enrichedBars,
    model,
    scaler,
    labels
  );
  console.log("🔎 Episode predictions:", episodes.slice(0, 2));

  // 6️⃣ Filter by confidence
  const confidenceThreshold = 0.6;
  const filteredEpisodes = episodes.filter(
    (ep) => ep.confidence >= confidenceThreshold
  );
  console.log(
    `✅ Using ${filteredEpisodes.length}/${episodes.length} episodes above confidence=${confidenceThreshold}`
  );

  // 7️⃣ Update overlays
  if (showTrends) {
    updateMLOverlays(filteredEpisodes);
  }
}

// --- Main function ---
export function addSelectedIndicators(
  selectedIndicators: string[],
  closeSeries: { time: number | string; value: number }[],
  data: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[],
  addLine: (
    key: string,
    seriesData: TV[],
    color: string,
    paneIndex?: number
  ) => any,
  subPaneIndicators: Set<string>,
  nextPaneIndex: number,
  indicatorRefs: React.MutableRefObject<
    Record<string, { series: any; paneIndex: number }>
  >
) {
  const times = closeSeries.map((d) => d.time);
  const closes = closeSeries.map((d) => d.value);
  const highs = data.map((d) => d.high);
  const lows = data.map((d) => d.low);
  const volumes = data.map((d) => d.volume);

  selectedIndicators.forEach((indicator) => {
    const isSubPane = subPaneIndicators.has(indicator);
    const paneIndex = isSubPane ? nextPaneIndex++ : 0;

    const setRef = (key: string, seriesData: TV[], color: string) => {
      if (!indicatorRefs.current[key]) {
        const series = addLine(key, seriesData, color, paneIndex);
        indicatorRefs.current[key] = { series, paneIndex };
      } else {
        indicatorRefs.current[key].series.setData(seriesData);
      }
    };

    switch (indicator) {
      // --- Moving averages ---
      case "Simple Moving Average (SMA)":
        setRef(
          "SMA",
          zipToTimes(times, sma({ period: 14, values: closes })),
          "#ffa500"
        );
        break;
      case "Exponential Moving Average (EMA)":
        setRef(
          "EMA",
          zipToTimes(times, ema({ period: 14, values: closes })),
          "#ff66cc"
        );
        break;
      case "Weighted Moving Average (WMA)":
        setRef(
          "WMA",
          zipToTimes(times, wma({ period: 14, values: closes })),
          "#66ccff"
        );
        break;
      case "Wilder’s Exponential Moving Average (WEMA)":
        setRef(
          "WEMA",
          zipToTimes(times, wema({ period: 14, values: closes })),
          "#00ccff"
        );
        break;

      // --- MACD ---
      case "MACD": {
        const macdout = macd({
          values: closes,
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9,
        });
        const { macd: macdLine, signal, histogram } = zipMACD(times, macdout);
        setRef("MACD_Line", macdLine, "#ffcc00");
        setRef("MACD_Signal", signal, "#ff66cc");
        setRef("MACD_Histogram", histogram, "#999999");
        break;
      }

      // --- Oscillators / Momentum ---
      case "RSI":
        setRef(
          "RSI",
          zipToTimes(times, rsi({ period: 14, values: closes })),
          "#00ffcc"
        );
        break;
      case "CCI":
        const ccihighs = data.map((d) => d.high);
        const ccilows = data.map((d) => d.low);
        const cciclosesArr = data.map((d) => d.close);

        const cciout = cci({
          period: 20,
          high: ccihighs,
          low: ccilows,
          close: cciclosesArr,
        });
        setRef("CCI", zipToTimes(times, cciout), "#ff9900");

        break;

      case "Awesome Oscillator": {
        // Typical AO uses median price ((high + low) / 2) with fast=5, slow=34
        const highs = data.map((d) => d.high);
        const lows = data.map((d) => d.low);

        // Call Awesome Oscillator with high/low arrays
        const aoOut = awesomeoscillator({
          high: highs,
          low: lows,
          fastPeriod: 5,
          slowPeriod: 34,
        });

        // Plot AO line
        setRef("AwesomeOsc", zipToTimes(times, aoOut), "#00aa88");
        break;
      }
      case "Rate of Change (ROC)":
        setRef(
          "ROC",
          zipToTimes(times, roc({ period: 12, values: closes })),
          "#cc00ff"
        );
        break;
      case "TRIX":
        setRef(
          "TRIX",
          zipToTimes(times, trix({ period: 15, values: closes })),
          "#0099ff"
        );
        break;
      case "Stochastic Oscillator":
        const stochastichighs = data.map((d) => d.high);
        const stochasticlows = data.map((d) => d.low);
        const stochasticclosesArr = data.map((d) => d.close);

        const stochasticout = stochastic({
          period: 14,
          high: stochastichighs,
          low: stochasticlows,
          close: stochasticclosesArr,
        });

        // out is StochasticOutput[] with { k?: number; d?: number }
        const start = times.length - stochasticout.length;

        const kSeries = stochasticout
          .map((o, i) =>
            o.k !== undefined ? { time: times[start + i], value: o.k } : null
          )
          .filter(Boolean) as TV[];

        const dSeries = stochasticout
          .map((o, i) =>
            o.d !== undefined ? { time: times[start + i], value: o.d } : null
          )
          .filter(Boolean) as TV[];

        // Add both lines
        setRef("Stochastic_K", kSeries, "#ff3300");
        setRef("Stochastic_D", dSeries, "#33ccff");
        break;
      case "Williams %R":
        const williamsrhighs = data.map((d) => d.high);
        const williamsrlows = data.map((d) => d.low);
        const williamsrclosesArr = data.map((d) => d.close);

        const williamsrout = williamsr({
          period: 14,
          high: williamsrhighs,
          low: williamsrlows,
          close: williamsrclosesArr,
        });
        setRef("WilliamsR", zipToTimes(times, williamsrout), "#33cc33");
        break;
      case "Stochastic RSI":
        const stochasticrsiclosesArr = data.map((d) => d.close);

        const stochasticrsiout = stochasticrsi({
          values: stochasticrsiclosesArr,
          rsiPeriod: 14, // RSI lookback
          stochasticPeriod: 14, // Stochastic lookback
          kPeriod: 3, // smoothing for %K
          dPeriod: 3, // smoothing for %D
        });

        // out is StochasticRSIOutput[] with { k?: number; d?: number }
        const stochasticrsistart = times.length - stochasticrsiout.length;

        const stochasticrsikSeries = stochasticrsiout
          .map((o, i) =>
            o.k !== undefined
              ? { time: times[stochasticrsistart + i], value: o.k }
              : null
          )
          .filter(Boolean) as TV[];

        const stochasticrsidSeries = stochasticrsiout
          .map((o, i) =>
            o.d !== undefined
              ? { time: times[stochasticrsistart + i], value: o.d }
              : null
          )
          .filter(Boolean) as TV[];

        setRef("StochRSI_K", stochasticrsikSeries, "#ffcc00");
        setRef("StochRSI_D", stochasticrsidSeries, "#00ccff");
        break;
      case "Parabolic SAR (PSAR)":
        const psarhighs = data.map((d) => d.high);
        const psarlows = data.map((d) => d.low);

        const psarout = psar({
          high: psarhighs,
          low: psarlows,
          step: 0.02, // default acceleration factor
          max: 0.2, // default maximum step
        });

        setRef("PSAR", zipToTimes(times, psarout), "#ff0066");
        break;
      case "Know Sure Thing (KST)":
        const kstclosesArr = data.map((d) => d.close);

        const kstout = kst({ values: kstclosesArr }); // returns KSTOutput[]

        const kststart = times.length - kstout.length;

        const kstSeries = kstout
          .map((o, i) =>
            o.kst !== undefined
              ? { time: times[kststart + i], value: o.kst }
              : null
          )
          .filter(Boolean) as TV[];

        const signalSeries = kstout
          .map((o, i) =>
            o.signal !== undefined
              ? { time: times[kststart + i], value: o.signal }
              : null
          )
          .filter(Boolean) as TV[];

        setRef("KST_Line", kstSeries, "#0066ff");
        setRef("KST_Signal", signalSeries, "#ff9900");
        break;
      case "Ultimate Oscillator":
        const ultimateoscillatorhighs = data.map((d) => d.high);
        const ultimateoscillatorlows = data.map((d) => d.low);
        const ultimateoscillatorclosesArr = data.map((d) => d.close);

        const ultimateoscillatorout = ultimateoscillator({
          high: ultimateoscillatorhighs,
          low: ultimateoscillatorlows,
          close: ultimateoscillatorclosesArr,
          period1: 7, // short lookback
          period2: 14, // medium lookback
          period3: 28, // long lookback
        });

        setRef(
          "UltimateOsc",
          zipToTimes(times, ultimateoscillatorout),
          "#cc6600"
        );
        break;
      case "Detrended Price Oscillator (DPO)":
        const dpoclosesArr = data.map((d) => d.close);

        const dpoout = dpo({
          values: dpoclosesArr,
          period: 20, // or whatever lookback you want
        });

        setRef("DPO", zipToTimes(times, dpoout), "#999999");
        break;
      case "Price Oscillator":
        const priceoscillatorclosesArr = data.map((d) => d.close);

        const priceoscillatorout = priceoscillator({
          values: priceoscillatorclosesArr,
          fastPeriod: 12, // typical fast lookback
          slowPeriod: 26, // typical slow lookback
        });

        setRef("PriceOsc", zipToTimes(times, priceoscillatorout), "#00cc99");
        break;
      case "Percentage Price Oscillator (PPO)":
        const ppoclosesArr = data.map((d) => d.close);

        const ppoout = ppo({
          values: ppoclosesArr,
          fastPeriod: 12, // typical fast lookback
          slowPeriod: 26, // typical slow lookback
          signalPeriod: 9, // typical signal smoothing
        });

        // out is PPOOutput[] with { ppo, signal, histogram }
        const ppostart = times.length - ppoout.length;

        const ppoSeries = ppoout
          .map((o, i) =>
            o.ppo !== undefined
              ? { time: times[ppostart + i], value: o.ppo }
              : null
          )
          .filter(Boolean) as TV[];

        const pposignalSeries = ppoout
          .map((o, i) =>
            o.signal !== undefined
              ? { time: times[ppostart + i], value: o.signal }
              : null
          )
          .filter(Boolean) as TV[];

        const histogramSeries = ppoout
          .map((o, i) =>
            o.histogram !== undefined
              ? { time: times[ppostart + i], value: o.histogram }
              : null
          )
          .filter(Boolean) as TV[];

        setRef("PPO_Line", ppoSeries, "#cc00cc");
        setRef("PPO_Signal", pposignalSeries, "#00ccff");
        setRef("PPO_Histogram", histogramSeries, "#999999");
        break;

      // --- Volume ---
      case "On-Balance Volume (OBV)":
        // Build arrays first
        const obvclosesArr = data.map((d) => d.close);
        const obvvolumesArr = data.map((d) => d.volume);

        // Call OBV
        const obvOut = obv({
          close: obvclosesArr,
          volume: obvvolumesArr,
        });

        // Plot OBV line
        setRef("OBV", zipToTimes(times, obvOut), "#ccff66");
        break;
      case "Accumulation/Distribution Line (ADL)":
        // Build OHLCV arrays first
        const adlOuthighs = data.map((d) => d.high);
        const adlOutlows = data.map((d) => d.low);
        const adlOutclosesArr = data.map((d) => d.close);
        const volumes = data.map((d) => d.volume);

        // Then call ADL
        const adlOut = adl({
          high: adlOuthighs,
          low: adlOutlows,
          close: adlOutclosesArr,
          volume: volumes,
        });

        // Plot the ADL line
        setRef("ADL", zipToTimes(times, adlOut), "#ffcc99");
        break;
      case "VWAP":
        // Build OHLCV arrays first
        const vwaphighs = data.map((d) => d.high);
        const vwaplows = data.map((d) => d.low);
        const vwapclosesArr = data.map((d) => d.close);
        const vwapvolumesArr = data.map((d) => d.volume);

        // Then call VWAP
        const vwapOut = vwap({
          high: vwaphighs,
          low: vwaplows,
          close: vwapclosesArr,
          volume: vwapvolumesArr,
        });

        // Plot VWAP line
        setRef("VWAP", zipToTimes(times, vwapOut), "#ff9966");
        break;
      case "Force Index":
        const forceindexclosesArr = data.map((d) => d.close);
        const forceindexvolumesArr = data.map((d) => d.volume);

        const forceindexout = forceindex({
          close: forceindexclosesArr,
          volume: forceindexvolumesArr,
          period: 13, // common default lookback
        });

        setRef("ForceIndex", zipToTimes(times, forceindexout), "#ff3300");
        break;
      case "Money Flow Index (MFI)":
        const mfihighs = data.map((d) => d.high);
        const mfilows = data.map((d) => d.low);
        const mficlosesArr = data.map((d) => d.close);
        const mfivolumesArr = data.map((d) => d.volume);

        const mfiout = mfi({
          high: mfihighs,
          low: mfilows,
          close: mficlosesArr,
          volume: mfivolumesArr,
          period: 14, // common default lookback
        });

        setRef("MFI", zipToTimes(times, mfiout), "#33cc33");
        break;

      // --- Volatility Indicators ---
      case "Bollinger Bands": {
        const bollingerbandsout = bollingerbands({
          period: 20,
          values: closes,
          stdDev: 2,
        });
        const { upper, middle, lower } = zipBB(times, bollingerbandsout);
        setRef("BB_Upper", upper, "#6eb5ff");
        setRef("BB_Middle", middle, "#c0c0c0");
        setRef("BB_Lower", lower, "#6eb5ff");
        break;
      }
      case "Average True Range (ATR)": {
        // Build OHLC arrays first
        const atrhighs = data.map((d) => d.high);
        const atrlows = data.map((d) => d.low);
        const atrclosesArr = data.map((d) => d.close);

        // Then call ATR
        const atrout = atr({
          period: 14,
          high: atrhighs,
          low: atrlows,
          close: atrclosesArr,
        });

        setRef("ATR", zipToTimes(times, atrout), "#ff00ff");
        break;
      }
      case "Keltner Channels": {
        // Build OHLC arrays first
        const keltnerchannelshighs = data.map((d) => d.high);
        const keltnerchannelslows = data.map((d) => d.low);
        const keltnerchannelsclosesArr = data.map((d) => d.close);

        // Then call Keltner Channels
        const keltnerchannelslowsout = keltnerchannels({
          period: 20,
          high: keltnerchannelshighs,
          low: keltnerchannelslows,
          close: keltnerchannelsclosesArr,
        });

        // Map output into upper/middle/lower bands
        const { upper, middle, lower } = zipBB(times, keltnerchannelslowsout);

        setRef("KC_Upper", upper, "#ff6600");
        setRef("KC_Middle", middle, "#999999");
        setRef("KC_Lower", lower, "#ff6600");
        break;
      }
      case "Chandelier Exit": {
        // Build OHLC arrays first
        const chandelierexithighs = data.map((d) => d.high);
        const chandelierexitlows = data.map((d) => d.low);
        const chandelierexitclosesArr = data.map((d) => d.close);

        // Then call Chandelier Exit
        const chandelierexitout = chandelierexit({
          period: 22,
          multiplier: 3,
          high: chandelierexithighs,
          low: chandelierexitlows,
          close: chandelierexitclosesArr,
        });

        // Extract exitLong values
        const exitLongLine = chandelierexitout.map((o) => o.exitLong);

        // Plot exitLong
        setRef(
          "ChandelierExit_Long",
          zipToTimes(times, exitLongLine),
          "#00cc00"
        );

        // Optionally also plot exitShort
        const exitShortLine = chandelierexitout.map((o) => o.exitShort);
        setRef(
          "ChandelierExit_Short",
          zipToTimes(times, exitShortLine),
          "#cc3300"
        );
        break;
      }
      case "Donchian Channels": {
        // Build OHLC arrays first
        const donchianchannelshighs = data.map((d) => d.high);
        const donchianchannelslows = data.map((d) => d.low);
        const donchianchannelsclosesArr = data.map((d) => d.close); // not needed for Donchian, but often handy

        // Then call Donchian Channels
        const donchianchannelsout = donchianchannels({
          period: 20,
          high: donchianchannelshighs,
          low: donchianchannelslows,
        });

        // Map output into upper/middle/lower bands
        const { upper, middle, lower } = zipBB(times, donchianchannelsout);

        setRef("Donchian_Upper", upper, "#00ccff");
        setRef("Donchian_Middle", middle, "#999999");
        setRef("Donchian_Lower", lower, "#00ccff");
        break;
      }
      case "Volatility Index": {
        const volatilityindexclosesArr = data.map((d) => d.close);

        const volatilityindexout = volatilityindex({
          values: volatilityindexclosesArr,
          period: 14, // or whatever lookback you want
        });

        setRef(
          "VolatilityIndex",
          zipToTimes(times, volatilityindexout),
          "#ffcc00"
        );
        break;
      }

      // --- Directional Movement ---
      case "True Range": {
        // Build OHLC arrays first
        const truerangehighs = data.map((d) => d.high);
        const truerangelows = data.map((d) => d.low);
        const truerangeclosesArr = data.map((d) => d.close);

        // Then call True Range
        const truerangeout = truerange({
          high: truerangehighs,
          low: truerangelows,
          close: truerangeclosesArr,
        });

        setRef("TrueRange", zipToTimes(times, truerangeout), "#ff9900");
        break;
      }
      case "ADX (Average Directional Index)": {
        // Build OHLC arrays first
        const adxhighs = data.map((d) => d.high);
        const adxlows = data.map((d) => d.low);
        const adxclosesArr = data.map((d) => d.close);

        // Then call ADX
        const adxout = adx({
          period: 14,
          high: adxhighs,
          low: adxlows,
          close: adxclosesArr,
        });

        // Extract the ADX values
        const adxLine = adxout.map((o) => o.adx);
        const pdiLine = adxout.map((o) => o.pdi);
        const mdiLine = adxout.map((o) => o.mdi);

        setRef("PDI", zipToTimes(times, pdiLine), "#0000ff"); // +DI (blue)
        setRef("MDI", zipToTimes(times, mdiLine), "#ff0000"); // –DI (red)

        // Plot ADX
        setRef("ADX", zipToTimes(times, adxLine), "#00ff00");
        break;
      }
      case "Plus DM": {
        // Build OHLC arrays first
        const plusdmhighs = data.map((d) => d.high);
        const plusdmlows = data.map((d) => d.low);

        // Then call PlusDM
        const plusdmout = plusdm({
          period: 14,
          high: plusdmhighs,
          low: plusdmlows,
        });

        setRef("PlusDM", zipToTimes(times, plusdmout), "#0066ff");
        break;
      }
      case "Minus DM": {
        // Build OHLC arrays first
        const minusdmhighs = data.map((d) => d.high);
        const minusdmlows = data.map((d) => d.low);

        // Then call MinusDM
        const minusdmout = minusdm({
          period: 14,
          high: minusdmhighs,
          low: minusdmlows,
        });

        setRef("MinusDM", zipToTimes(times, minusdmout), "#ff0000");
        break;
      }

      // --- Trend Indicators ---
      case "Ichimoku Cloud": {
        const ichimokucloudhighs = data.map((d) => d.high);
        const ichimokucloudlows = data.map((d) => d.low);

        const ichimokucloudout = ichimokucloud({
          high: ichimokucloudhighs,
          low: ichimokucloudlows,
        });

        // Then map the outputs
        setRef(
          "Ichimoku_Conversion",
          zipToTimes(
            times,
            ichimokucloudout.map((o) => o.conversion)
          ),
          "#ff6600"
        );
        setRef(
          "Ichimoku_Base",
          zipToTimes(
            times,
            ichimokucloudout.map((o) => o.base)
          ),
          "#0066ff"
        );
        setRef(
          "Ichimoku_SpanA",
          zipToTimes(
            times,
            ichimokucloudout.map((o) => o.spanA)
          ),
          "#00cc99"
        );
        setRef(
          "Ichimoku_SpanB",
          zipToTimes(
            times,
            ichimokucloudout.map((o) => o.spanB)
          ),
          "#cc00cc"
        );
        break;
      }
      case "SuperTrend": {
        // Build OHLC arrays first
        const supertrendhighs = data.map((d) => d.high);
        const supertrendlows = data.map((d) => d.low);
        const supertrendclosesArr = data.map((d) => d.close);

        // Then call SuperTrend
        const supertrendout = supertrend({
          period: 10,
          multiplier: 3,
          high: supertrendhighs,
          low: supertrendlows,
          close: supertrendclosesArr,
        });

        // Extract the supertrend line
        const supertrendLine = supertrendout.map((o) => o.supertrend);

        // Plot the SuperTrend line
        setRef("SuperTrend", zipToTimes(times, supertrendLine), "#00cc00");
        break;
      }
      case "Aroon Indicator": {
        const aroonhighs = data.map((d) => d.high);
        const aroonlows = data.map((d) => d.low);

        const aroonout = aroon({
          period: 14,
          high: aroonhighs,
          low: aroonlows,
        });

        // You must pick which line(s) to plot:
        const aroonUp = aroonout.map((o) => o.aroonUp);
        const aroonDown = aroonout.map((o) => o.aroonDown);
        const aroonOsc = aroonout.map((o) => o.aroonOscillator);

        setRef("AroonUp", zipToTimes(times, aroonUp), "#00cc00");
        setRef("AroonDown", zipToTimes(times, aroonDown), "#cc0000");
        setRef("AroonOscIndicator", zipToTimes(times, aroonOsc), "#ffcc00");
        break;
      }
      case "Aroon Oscillator": {
        // Build OHLC arrays first
        const aroonoscillatorhighs = data.map((d) => d.high);
        const aroonoscillatorlows = data.map((d) => d.low);

        // Then call Aroon Oscillator
        const aroonoscillatorout = aroonoscillator({
          period: 14,
          high: aroonoscillatorhighs,
          low: aroonoscillatorlows,
        });

        setRef("AroonOsc", zipToTimes(times, aroonoscillatorout), "#cc00ff");
        break;
      }
      case "Linear Regression": {
        // Build closes array
        const linearregressionclosesArr = data.map((d) => d.close);

        // Call Linear Regression
        const linearregressionout = linearregression({
          values: linearregressionclosesArr,
          period: 14, // lookback window
        });

        // Extract the forecast values
        const forecastLine = linearregressionout.map((o) => o.forecast);

        // Plot the forecast line
        setRef("LinearRegression", zipToTimes(times, forecastLine), "#0099ff");
        break;
      }
      case "Moving Average Envelope": {
        const closesArr = data.map((d) => d.close);

        // Call MAEnvelope with the correct property name
        const out = maenvelope({
          period: 20,
          values: closesArr,
          percentage: 0.05, // <-- correct field name
          maType: "sma", // optional, defaults to SMA if not provided
        });

        // zipBB expects an array of MAEnvelopeOutput objects
        const { upper, middle, lower } = zipBB(times, out);

        setRef("MAEnvelope_Upper", upper, "#ff6600");
        setRef("MAEnvelope_Middle", middle, "#999999");
        setRef("MAEnvelope_Lower", lower, "#ff6600");
        break;
      }
      case "Pivot Points": {
        // Build OHLC arrays
        const pivotpointshighs = data.map((d) => d.high);
        const pivotpointslows = data.map((d) => d.low);
        const pivotpointsclosesArr = data.map((d) => d.close);

        // Then call Pivot Points
        const pivotpointsout = pivotpoints({
          high: pivotpointshighs,
          low: pivotpointslows,
          close: pivotpointsclosesArr,
          type: "standard", // optional, defaults to standard if omitted
        });

        // Extract the pivot values
        const pivotLine = pivotpointsout.map((o) => o.pivot);

        // Plot the pivot line
        setRef("PivotPoints", zipToTimes(times, pivotLine), "#ffcc99");
        break;
      }
    }
  });
}

export function removeUnselectedIndicators(
  selectedIndicators: string[],
  chart: any,
  indicatorRefs: React.MutableRefObject<
    Record<string, { series: any; paneIndex: number }>
  >
) {
  const indicatorKeyMap: Record<string, string[]> = {
    // --- Moving averages ---
    "Simple Moving Average (SMA)": ["SMA"],
    "Exponential Moving Average (EMA)": ["EMA"],
    "Weighted Moving Average (WMA)": ["WMA"],
    "Wilder’s Exponential Moving Average (WEMA)": ["WEMA"],

    // --- MACD / PPO ---
    MACD: ["MACD_Line", "MACD_Signal", "MACD_Histogram"],
    "Percentage Price Oscillator (PPO)": [
      "PPO_Line",
      "PPO_Signal",
      "PPO_Histogram",
    ],

    // --- Oscillators / Momentum ---
    RSI: ["RSI"],
    CCI: ["CCI"],
    "Rate of Change (ROC)": ["ROC"],
    "Awesome Oscillator": ["AwesomeOsc"],
    TRIX: ["TRIX"],
    "Stochastic Oscillator": ["Stochastic_K", "Stochastic_D"],
    "Williams %R": ["WilliamsR"],
    "Stochastic RSI": ["StochRSI_K", "StochRSI_D"],
    "Parabolic SAR (PSAR)": ["PSAR"],
    "Know Sure Thing (KST)": ["KST_Line", "KST_Signal"],
    "Ultimate Oscillator": ["UltimateOsc"],
    "Detrended Price Oscillator (DPO)": ["DPO"],
    "Price Oscillator": ["PriceOsc"],

    // --- Volume-based ---
    "On-Balance Volume (OBV)": ["OBV"],
    "Accumulation/Distribution Line (ADL)": ["ADL"],
    VWAP: ["VWAP"],
    "Force Index": ["ForceIndex"],
    "Money Flow Index (MFI)": ["MFI"],
    "Volume Profile": ["VolumeProfile"],

    // --- Volatility Indicators ---
    "Bollinger Bands": ["BB_Upper", "BB_Middle", "BB_Lower"],
    "Average True Range (ATR)": ["ATR"],
    "Keltner Channels": ["KC_Upper", "KC_Middle", "KC_Lower"],
    "Chandelier Exit": ["ChandelierExit_Long", "ChandelierExit_Short"],
    "Donchian Channels": [
      "Donchian_Upper",
      "Donchian_Middle",
      "Donchian_Lower",
    ],
    "Volatility Index": ["VolatilityIndex"],
    "True Range": ["TrueRange"],

    // --- Directional Movement ---
    "ADX (Average Directional Index)": ["ADX", "PDI", "MDI"],
    "Plus DM": ["PlusDM"],
    "Minus DM": ["MinusDM"],

    // --- Trend Indicators ---
    "Ichimoku Cloud": [
      "Ichimoku_Conversion",
      "Ichimoku_Base",
      "Ichimoku_SpanA",
      "Ichimoku_SpanB",
    ],
    SuperTrend: ["SuperTrend"],
    "Aroon Indicator": ["AroonUp", "AroonDown", "AroonOscIndicator"],
    "Aroon Oscillator": ["AroonOsc"],
    "Linear Regression": ["LinearRegression"],
    "Moving Average Envelope": [
      "MAEnvelope_Upper",
      "MAEnvelope_Middle",
      "MAEnvelope_Lower",
    ],
    "Pivot Points": ["PivotPoints"],
  };

  const activeKeys = new Set<string>();
  selectedIndicators.forEach((indicator) => {
    const keys = indicatorKeyMap[indicator];
    if (keys) keys.forEach((k) => activeKeys.add(k));
  });

  Object.keys(indicatorRefs.current).forEach((key) => {
    if (!activeKeys.has(key)) {
      const { series, paneIndex } = indicatorRefs.current[key];

      console.log(`🗑 Removing indicatorRef key: ${key}`, {
        series,
        paneIndex,
      });

      console.log(indicatorRefs.current);
      delete indicatorRefs.current[key];
      console.log(`panes: `, chart.panes());
      console.log(`pane length: ${chart.panes().length}`);
      console.log(
        `series in pane ${paneIndex}: `,
        chart.panes()[paneIndex],
        chart.panes()[paneIndex - 1]
      );
      if (paneIndex !== 0) {
        console.log(`removing series at ${paneIndex}: `, series);
        console.log(
          `logging how many series in this pane: `,
          chart.panes()[paneIndex].getSeries().length
        );
        if (chart.panes()[paneIndex].getSeries().length > 1) {
          chart.removeSeries(series);
        } else {
          chart.removePane(paneIndex);

          // 🔄 After removing a pane, re‑sync all indicatorRefs
          Object.keys(indicatorRefs.current).forEach((k) => {
            const ref = indicatorRefs.current[k];
            if (ref.paneIndex > paneIndex) {
              // decrement only those beyond the removed pane
              ref.paneIndex = ref.paneIndex - 1;
            }
            // leave paneIndex 0 and 1 untouched
          });
        }
      } else {
        console.log(`removing series at ${paneIndex}: `, series);
        chart.removeSeries(series);
      }
      console.log(indicatorRefs.current);
    }
  });
}

export function startRealtimeChartUpdates(
  priceData: any[],
  volumeDataSample: any[],
  seriesRef: React.MutableRefObject<any>,
  volumeSeriesRef: React.MutableRefObject<any>,
  currentIndexRef: React.MutableRefObject<number>,
  ticker: string,
  model: any,
  scaler: any,
  labels: any,
  showTrends: boolean,
  overlayRefs: React.MutableRefObject<Record<string, any>>,
  updateMLOverlays: (episodes: any[]) => void,
  subPaneIndicators: Set<string>,
  nextPaneIndex: number,
  indicatorRefs: React.MutableRefObject<Record<string, any>>, // ✅ new parameter
  //   !later we will need to actually pass indicators into this thing
  selectedIndicators: string[]
): NodeJS.Timeout {
  const intervalID = setInterval(() => {
    if (currentIndexRef.current >= priceData.length) {
      clearInterval(intervalID);
      return;
    }

    const p = priceData[currentIndexRef.current];
    const v = volumeDataSample[currentIndexRef.current];

    const nextPricePoint = {
      time: Number(p.time),
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
    };

    const nextVolumePoint = {
      time: Number(v.time),
      value: v.value,
      color: v.color,
    };

    try {
      seriesRef.current.update(nextPricePoint);
      volumeSeriesRef.current.update(nextVolumePoint);

      console.log("✅ Updated candlestick series with:", nextPricePoint);
      console.log("✅ Updated volume series with:", nextVolumePoint);

      // 🔎 Update indicators with all data so far
      const dataSoFar = priceData.slice(0, currentIndexRef.current + 1);
      const closeSeries = normalizeCloseSeries(dataSoFar);
      const closes = closeSeries.map((d) => d.value); // number[]

      addSelectedIndicators(
        selectedIndicators,
        closeSeries,
        // closes,
        dataSoFar,
        addLine,
        subPaneIndicators,
        nextPaneIndex,
        indicatorRefs // ✅ pass indicatorRefs here
      );

      // 🔎 Call ML overlay helper
      if (showTrends && model && scaler) {
        (async () => {
          const dataML = priceData.slice(0, currentIndexRef.current + 1);
          await runMLPredictionOverlay(
            dataML,
            ticker,
            model,
            scaler,
            labels,
            showTrends,
            overlayRefs,
            updateMLOverlays
          );
        })();
      }
    } catch (err) {
      console.error("❌ Chart update error:", err);
    }

    currentIndexRef.current++;
  }, 2000);

  return intervalID;
}
