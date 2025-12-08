"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  LineSeries,
  CandlestickSeries,
  HistogramSeries,
  createSeriesMarkers,
  LineData,
  Time,
  WhitespaceData,
} from "lightweight-charts";
import { useChartStore } from "@/stores/chartStore";
import { useIndicatorStore } from "@/stores/useIndicatorStore";
import {
  normalizeCloseSeries,
  filterValidPoints,
  computeRSI,
  computeBollingerBands,
  computeVWAP,
  computeOBV,
  computeMACD,
  computeWMA,
  computeEMA,
  computeSMA,
} from "@/lib/indicators";
import { getEpisodePredictions } from "@/hooks/useEpisodeFeatures";
import { RawRow } from "@/lib/episodeBuilder";
import { StandardScaler } from "../ml-pipeline/featureBuilder";
import * as tf from "@tensorflow/tfjs";

import { priceData, volumeDataSample } from "../../public/sample_test_data";

interface Props {
  width: number;
  height: number;
}

type IndicatorRef = {
  series: any;
  paneIndex: number;
};

export default function Chart({ width, height }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<any>(null);
  const seriesTypeRef = useRef<string | null>(null);
  const overlayRefs = useRef<Record<string, any>>({});
  const volumeSeriesRef = useRef<any>(null);
  const indicatorRefs = useRef<Record<string, IndicatorRef>>({});
  const subPaneIndicators = new Set(["RSI", "MACD", "OBV"]);
  let nextPaneIndexRef = useRef<number>(2);
  const prevTickerRef = useRef<string>("");
  const prevTimeframeRef = useRef<string>("");
  const prevDataRef = useRef<typeof candleStickData>([]);

  //! only for mocking realtime with static data
  const currentIndexRef = useRef(50);

  // const { chartType, ticker, setChartSeries, timeframe, showTrends } =
  const {
    chartType,
    ticker,
    timeframe,
    showTrends,
    candleStickData,
    setCandleStickData,
  } = useChartStore();
  const { selectedIndicators } = useIndicatorStore();

  const [isChartReady, setChartReady] = useState(false);

  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [scaler, setScaler] = useState<StandardScaler | null>(null);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    async function loadModelFromPublic() {
      try {
        // 1️⃣ Load TF.js model
        const loadedModel = await tf.loadLayersModel(
          "/models/supervised-model.json"
        );
        setModel(loadedModel);
        console.log("✅ Model loaded from /public/models");

        // 2️⃣ Load scaler.json
        const res = await fetch("/models/scaler.json");
        const scalerData = await res.json();

        // 3️⃣ Use arrays directly (no Object.values needed)
        const loadedScaler = StandardScaler.fromJSON({
          means: scalerData.means,
          stds: scalerData.stds,
        });
        setScaler(loadedScaler);

        // 4️⃣ Labels
        setLabels(scalerData.labelNames);

        // 5️⃣ Debug logs
        console.log("✅ Scaler + labels loaded:", {
          labelNames: scalerData.labelNames,
          meansLength: loadedScaler.means?.length,
          stdsLength: loadedScaler.stds?.length,
        });
      } catch (err) {
        console.error("❌ Error loading model/scaler:", err);
      }
    }

    loadModelFromPublic();
  }, []);

  // 🧱 Chart creation
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container || chartRef.current || width === 0 || height === 0) return;

    chartRef.current = createChart(container, {
      width,
      height,
      layout: {
        background: { color: "#2c2c2c" },
        textColor: "#DDD",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "#444" },
        horzLines: { color: "#444" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
      },
    });

    setChartReady(true);
  }, [width, height]);

  // Effect for resizing chart on window resize
  // 🔄 Resize chart when props change
  useEffect(() => {
    if (chartRef.current && width > 0 && height > 0) {
      chartRef.current.resize(width, height);
    }
  }, [width, height]);
  // !separate effects begining
  const addLine = (key: string, data: any[], color: string, paneIndex = 0) => {
    const chart = chartRef.current;
    if (!chart || !isChartReady) return;
    const safe = filterValidPoints(data);
    if (safe.length === 0) return;
    const line = chart.addSeries(
      LineSeries,
      { color, lineWidth: 2 },
      paneIndex
    );
    line.setData(safe as unknown as (LineData<Time> | WhitespaceData<Time>)[]);
    overlayRefs.current[key] = line;

    return line; // ✅ return the series object
  };

  const updateMLOverlays = (filteredEpisodes: any[]) => {
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

  async function runMLPredictionOverlay(
    data: any[],
    ticker: string,
    model: any,
    scaler: any,
    labels: any,
    showTrends: boolean,
    overlayRefs: React.MutableRefObject<Record<string, any>>,
    updateMLOverlays: (episodes: any[]) => void
  ) {
    // If trends are disabled or model/scaler missing, clear overlays and bail
    if (!showTrends || !model || !scaler) {
      const markerPrimitive = overlayRefs.current["MLMarkers"];
      if (markerPrimitive) {
        markerPrimitive.setMarkers([]); // remove all markers
        delete overlayRefs.current["MLMarkers"];
      }
      return;
    }

    // 1️⃣ Prepare base OHLCV series
    const dataML = data; // later you can reuse main chart data directly

    // 2️⃣ Compute indicators + enrich bars
    const closeSeriesML = normalizeCloseSeries(dataML);
    const rsiSeries = computeRSI(closeSeriesML, 14);
    const emaSeries = computeEMA(closeSeriesML, 14);
    const bbSeries = computeBollingerBands(closeSeriesML, 20, 2);
    const vwapSeries = computeVWAP(
      dataML.map((d: any) => ({
        time: d.time,
        value: d.close,
        volume: d.volume,
      }))
    );
    const obvSeries = computeOBV(
      dataML.map((d: any) => ({
        time: d.time,
        value: d.close,
        volume: d.volume,
      }))
    );

    const idx = <T extends { time: number }>(arr: T[]) =>
      arr.reduce((m, x) => (m.set(x.time, x), m), new Map<number, T>());

    const rsiMap = idx(rsiSeries as { time: number; value: number }[]);
    const emaMap = idx(emaSeries as { time: number; value: number }[]);
    const bbMap = idx(bbSeries as unknown as { time: number; value: number }[]);
    const vwapMap = idx(vwapSeries as { time: number; value: number }[]);
    const obvMap = idx(obvSeries as { time: number; value: number }[]);

    const enrichedBars: RawRow[] = dataML.map((d: any) => {
      const bb = bbMap.get(d.time) as
        | { upper: number; middle: number; lower: number }
        | undefined;
      return {
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
        bb_upper: bb?.upper ?? null,
        bb_middle: bb?.middle ?? null,
        bb_lower: bb?.lower ?? null,
      };
    });

    // 3️⃣ Run episode‑level predictions
    const episodes = await getEpisodePredictions(
      enrichedBars,
      model,
      scaler,
      labels
    );
    console.log("🔎 Episode predictions:", episodes.slice(0, 2));

    // 🔎 Filter by confidence threshold
    const confidenceThreshold = 0.6; // tune this (0.6–0.8 is common)
    const filteredEpisodes = episodes.filter(
      (ep) => ep.confidence >= confidenceThreshold
    );

    console.log(
      `✅ Using ${filteredEpisodes.length}/${episodes.length} episodes above confidence=${confidenceThreshold}`
    );

    // ✅ Create markers and store plugin reference
    if (showTrends) {
      updateMLOverlays(filteredEpisodes);
    } else {
      return;
    }
  }

  function addSelectedIndicators(
    selectedIndicators: string[],
    closeSeries: any[],
    data: { time: number; close: number; volume: number }[],
    addLine: (
      key: string,
      seriesData: any[],
      color: string,
      paneIndex?: number
    ) => any, // return the created series object
    subPaneIndicators: Set<string>,
    nextPaneIndex: number,
    indicatorRefs: React.MutableRefObject<Record<string, IndicatorRef>>
  ) {
    console.log("🔎 addSelectedIndicators called");
    console.log("➡️ selectedIndicators:", selectedIndicators);

    selectedIndicators.forEach((indicator) => {
      const isSubPane = subPaneIndicators.has(indicator);
      const paneIndex = isSubPane ? nextPaneIndex++ : 0;

      const setRef = (key: string, data: any[], color: string) => {
        if (!indicatorRefs.current[key]) {
          const series = addLine(key, data, color, paneIndex);
          indicatorRefs.current[key] = { series, paneIndex };
          console.log(
            `➕ Added indicatorRef key: ${key}`,
            indicatorRefs.current[key]
          );
        } else {
          indicatorRefs.current[key].series.setData(data);
          console.log(
            `🔄 Updated indicatorRef key: ${key}`,
            indicatorRefs.current[key]
          );
        }
      };

      switch (indicator) {
        case "Simple Moving Average": {
          const sma = computeSMA(closeSeries, 14);
          setRef("SMA", sma, "#ffa500");
          break;
        }

        case "Exponential Moving Average": {
          const ema = computeEMA(closeSeries, 14);
          setRef("EMA", ema, "#ff66cc");
          break;
        }

        case "Weighted Moving Average": {
          const wma = computeWMA(closeSeries, 14);
          setRef("WMA", wma, "#66ccff");
          break;
        }

        case "RSI": {
          const rsi = computeRSI(closeSeries, 14);
          setRef("RSI", rsi, "#00ffcc");
          break;
        }

        case "MACD": {
          const { macd, signal, histogram } = computeMACD(closeSeries);
          setRef("MACD_Line", macd, "#ffcc00");
          setRef("MACD_Signal", signal, "#ff66cc");
          setRef("MACD_Histogram", histogram, "#999999");
          break;
        }

        case "OBV": {
          const obv = computeOBV(
            data.map((d) => ({
              time: d.time,
              value: d.close,
              volume: d.volume,
            }))
          );
          setRef("OBV", obv, "#ccff66");
          break;
        }

        case "VWAP": {
          const vwap = computeVWAP(
            data.map((d) => ({
              time: d.time,
              value: d.close,
              volume: d.volume,
            }))
          );
          setRef("VWAP", vwap, "#ff9966");
          break;
        }

        case "Bollinger Bands": {
          const bands = computeBollingerBands(closeSeries, 20, 2);
          const upper = bands.map((d) => ({ time: d.time, value: d.upper }));
          const middle = bands.map((d) => ({ time: d.time, value: d.middle }));
          const lower = bands.map((d) => ({ time: d.time, value: d.lower }));

          setRef("BB_Upper", upper, "#ff6666");
          setRef("BB_Middle", middle, "#cccccc");
          setRef("BB_Lower", lower, "#6666ff");
          break;
        }
      }
    });
  }

  function removeUnselectedIndicators(
    selectedIndicators: string[],
    chart: any,
    indicatorRefs: React.MutableRefObject<
      Record<string, { series: any; paneIndex: number }>
    >
  ) {
    const indicatorKeyMap: Record<string, string[]> = {
      "Simple Moving Average": ["SMA"],
      "Exponential Moving Average": ["EMA"],
      "Weighted Moving Average": ["WMA"],
      RSI: ["RSI"],
      MACD: ["MACD_Line", "MACD_Signal", "MACD_Histogram"],
      OBV: ["OBV"],
      VWAP: ["VWAP"],
      "Bollinger Bands": ["BB_Upper", "BB_Middle", "BB_Lower"],
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

  function startRealtimeChartUpdates(
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
    indicatorRefs: React.MutableRefObject<Record<string, any>> // ✅ new parameter
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
        addSelectedIndicators(
          selectedIndicators,
          closeSeries,
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

  // todo all effects separated
  // changes the chart type between candles and line
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !isChartReady || !ticker) return;
    // !for mocking realtime with static data
    // let intervalID: NodeJS.Timeout; // declare in effect scope

    // Create main series if there is none initially or switch and set new one if chart type changes
    if (!seriesRef.current || seriesTypeRef.current !== chartType) {
      console.log(`creating new series`);
      let oldSeries = seriesRef.current;

      seriesRef.current =
        chartType === "line"
          ? chart.addSeries(LineSeries, { color: "#83ffe6" }, 0)
          : chart.addSeries(
              CandlestickSeries,
              {
                wickUpColor: "#83ffe6",
                upColor: "#83ffe6",
                wickDownColor: "#ff5f5f",
                downColor: "#ff5f5f",
              },
              0
            );
      seriesTypeRef.current = chartType;
      oldSeries && chart.removeSeries(oldSeries);
    }

    if (!volumeSeriesRef.current || seriesTypeRef.current !== chartType) {
      console.log(`creating new volume series`);
      let oldVolumeSeries = volumeSeriesRef.current;

      volumeSeriesRef.current = chart.addSeries(
        HistogramSeries,
        {
          color: "#26a69a",
          priceFormat: { type: "volume" },
          priceScaleId: "",
        },
        1
      );

      oldVolumeSeries && chart.removeSeries(oldVolumeSeries);
    }

    const mainSeriesData =
      chartType === "line"
        ? candleStickData.map((d: { time: number; close: number }) => ({
            time: d.time,
            value: d.close,
          }))
        : candleStickData;

    const mockmainseriesdata =
      chartType === "line"
        ? priceData.slice(0, 50).map((d: { time: number; close: number }) => ({
            time: d.time,
            value: d.close,
          }))
        : priceData.slice(0, 50);

    seriesRef.current.setData(mainSeriesData);
    // seriesRef.current.setData(mockmainseriesdata);

    // 🔻 Volume pane
    const volumeData = candleStickData.map(
      (d: { time: number; volume: number; close: number; open: number }) => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? "#c2b0ff" : "#fd0054",
      })
    );

    volumeSeriesRef.current.setData(volumeData);
    // volumeSeriesRef.current.setData(volumeDataSample.slice(0, 50));

    // console.log("mainSeriesData sample:", mainSeriesData);
    // console.log("🔎 Volume data sample:", volumeData);

    chart.timeScale().fitContent();
  }, [chartType, ticker, isChartReady, candleStickData]);

  // fetches data to store in global state and for chart upon ticker changes and timeframe changes
  useEffect(() => {
    console.log(`getting new data`);
    const chart = chartRef.current;
    if (!chart || !isChartReady || !ticker) return;
    const fetchChartData = async () => {
      try {
        const { ticker, chartType, timeframe } = useChartStore.getState();
        const res = await fetch(
          `/api/alpaca/bars?ticker=${ticker}&timeframe=${timeframe}`
        );
        const raw = await res.json();

        const offset = new Date().getTimezoneOffset() * 60;
        const data = raw
          .map(
            (d: {
              time: string;
              open: string;
              high: string;
              low: string;
              close: string;
              volume: string;
            }) => ({
              time: new Date(d.time).getTime() / 1000 - offset,
              open: parseFloat(d.open),
              high: parseFloat(d.high),
              low: parseFloat(d.low),
              close: parseFloat(d.close),
              volume: parseFloat(d.volume),
            })
          )
          .sort((a: { time: number }, b: { time: number }) => a.time - b.time);
        // !later for real case set with real data not priceData
        // setCandleStickData(priceData.slice(0, 50));
        setCandleStickData(data);
      } catch (err) {
        console.error("[Fetch] Failed to fetch chart data:", err);
      }
    };

    fetchChartData();
  }, [ticker, isChartReady, timeframe]);

  // handles indicators
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !isChartReady || !ticker) return;
    // const closeSeries = normalizeCloseSeries(priceData.slice(0, 50));
    const closeSeries = normalizeCloseSeries(candleStickData);

    console.log(`panes: ${chart.panes()}`, chart.panes(), chart.panes().length);

    addSelectedIndicators(
      selectedIndicators,
      closeSeries,
      candleStickData,
      addLine,
      subPaneIndicators,
      nextPaneIndexRef.current,
      indicatorRefs
    );

    // Remove any unselected indicators
    removeUnselectedIndicators(selectedIndicators, chart, indicatorRefs);
  }, [selectedIndicators, candleStickData, ticker, isChartReady]);

  //todo tmrw need to delete old ml overlays if one of the dependencies changes otherwise they just add up handles effects for ml inference
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !isChartReady || !ticker) return;

    // Cleanup overlays when showTrends is false
    if (
      !showTrends ||
      prevTickerRef.current !== ticker ||
      prevDataRef.current !== candleStickData ||
      prevTimeframeRef.current !== timeframe
    ) {
      Object.keys(overlayRefs.current)
        .filter((key) => key.startsWith("ML Dashed") || key === "MLMarkers")
        .forEach((key) => {
          const overlay = overlayRefs.current[key];

          if (overlay && typeof overlay.setData === "function") {
            chart.removeSeries(overlay); // remove dashed line series
          } else if (overlay && typeof overlay.setMarkers === "function") {
            overlay.setMarkers([]); // clear markers
          }

          delete overlayRefs.current[key];
        });

      // Update refs to current values
      prevTickerRef.current = ticker;
      prevDataRef.current = candleStickData;
      prevTimeframeRef.current = timeframe;
    }

    runMLPredictionOverlay(
      candleStickData, // or priceData.slice(0, currentIndexRef.current + 1)
      // priceData.slice(0, 50), // or priceData.slice(0, currentIndexRef.current + 1)
      ticker,
      model,
      scaler,
      labels,
      showTrends,
      overlayRefs,
      updateMLOverlays
    );
  }, [showTrends, ticker, timeframe, candleStickData]);

  // ! separate effects end

  // 📈 Series + overlay update
  useEffect(() => {
    // const chart = chartRef.current;
    // if (!chart || !isChartReady || !ticker) return;
    // // !for mocking realtime with static data
    // let intervalID: NodeJS.Timeout; // declare in effect scope
    // // Cleanup
    // if (seriesRef.current && seriesTypeRef.current !== chartType) {
    //   chart.removeSeries(seriesRef.current);
    //   seriesRef.current = null;
    // }
    // // Remove any line/candle series overlays
    // Object.values(overlayRefs.current).forEach((overlay) => {
    //   // only remove if it's a series
    //   if (overlay && typeof overlay.setData === "function") {
    //     chart.removeSeries(overlay);
    //   }
    //   // if it's a marker plugin, detach instead
    //   if (overlay && typeof overlay.setMarkers === "function") {
    //     overlay.setMarkers([]); // clear markers
    //     overlay.detach(); // optional: fully detach
    //   }
    // });
    // overlayRefs.current = {};
    // if (volumeSeriesRef.current) {
    //   chart.removeSeries(volumeSeriesRef.current);
    //   volumeSeriesRef.current = null;
    // }
    // // Create main series
    // if (!seriesRef.current) {
    //   seriesRef.current =
    //     chartType === "line"
    //       ? chart.addSeries(LineSeries, { color: "#83ffe6" })
    //       : chart.addSeries(CandlestickSeries, {
    //           wickUpColor: "#83ffe6",
    //           upColor: "#83ffe6",
    //           wickDownColor: "#ff5f5f",
    //           downColor: "#ff5f5f",
    //         });
    //   seriesTypeRef.current = chartType;
    // }
    // const updateChartData = async () => {
    //   try {
    //     const { ticker, chartType, timeframe } = useChartStore.getState();
    //     const res = await fetch(
    //       `/api/alpaca/bars?ticker=${ticker}&timeframe=${timeframe}`
    //     );
    //     const raw = await res.json();
    //     const offset = new Date().getTimezoneOffset() * 60;
    //     const data = raw
    //       .map(
    //         (d: {
    //           time: string;
    //           open: string;
    //           high: string;
    //           low: string;
    //           close: string;
    //           volume: string;
    //         }) => ({
    //           time: new Date(d.time).getTime() / 1000 - offset,
    //           open: parseFloat(d.open),
    //           high: parseFloat(d.high),
    //           low: parseFloat(d.low),
    //           close: parseFloat(d.close),
    //           volume: parseFloat(d.volume),
    //         })
    //       )
    //       .sort((a: { time: number }, b: { time: number }) => a.time - b.time);
    //     const mainSeriesData =
    //       chartType === "line"
    //         ? data.map((d: { time: number; close: number }) => ({
    //             time: d.time,
    //             value: d.close,
    //           }))
    //         : data;
    //     // seriesRef.current.setData(mainSeriesData);
    //     seriesRef.current.setData(priceData.slice(0, 50));
    //     chart.timeScale().fitContent();
    //     setChartSeries(ticker, data);
    //     // 🔻 Volume pane
    //     const volumeData = data.map(
    //       (d: {
    //         time: string;
    //         volume: number;
    //         close: number;
    //         open: number;
    //       }) => ({
    //         time: d.time,
    //         value: d.volume,
    //         color: d.close >= d.open ? "#c2b0ff" : "#fd0054",
    //       })
    //     );
    //     console.log("mainSeriesData sample:", mainSeriesData);
    //     console.log("🔎 Volume data sample:", volumeData);
    //     if (!volumeSeriesRef.current) {
    //       volumeSeriesRef.current = chart.addSeries(
    //         HistogramSeries,
    //         {
    //           color: "#26a69a",
    //           priceFormat: { type: "volume" },
    //           priceScaleId: "",
    //         },
    //         1
    //       );
    //       // volumeSeriesRef.current.setData(volumeData);
    //       volumeSeriesRef.current.setData(volumeDataSample.slice(0, 50));
    //     }
    //     // 🔍 Indicator overlays
    //     // const closeSeries = normalizeCloseSeries(data);
    //     const closeSeries = normalizeCloseSeries(priceData.slice(0, 50));
    //     const subPaneIndicators = new Set(["RSI", "MACD", "OBV"]);
    //     let nextPaneIndex = 2;
    //     addSelectedIndicators(
    //       selectedIndicators,
    //       closeSeries,
    //       // data,
    //       // @ts-ignore
    //       priceData.slice(0, 50),
    //       addLine,
    //       subPaneIndicators,
    //       { current: nextPaneIndex },
    //       indicatorRefs // <-- new parameter
    //     );
    //     //! realtime update chart
    //     // intervalID = startRealtimeChartUpdates(
    //     //   priceData,
    //     //   volumeDataSample,
    //     //   seriesRef,
    //     //   volumeSeriesRef,
    //     //   currentIndexRef,
    //     //   ticker,
    //     //   model,
    //     //   scaler,
    //     //   labels,
    //     //   showTrends,
    //     //   overlayRefs,
    //     //   updateMLOverlays,
    //     //   subPaneIndicators,
    //     //   { current: nextPaneIndex },
    //     //   indicatorRefs // ✅ pass your ref here
    //     // );
    //   } catch (err) {
    //     console.error("[Fetch] Failed to fetch chart data:", err);
    //   }
    // };
    // updateChartData();
    // //! ✅ cleanup realtime interval for static data
    // return () => {
    //   clearInterval(intervalID); // make sure intervalID is accessible
    //   const markerPrimitive = overlayRefs.current["MLMarkers"];
    //   if (markerPrimitive) {
    //     markerPrimitive.setMarkers([]);
    //     delete overlayRefs.current["MLMarkers"];
    //   }
    // };
  }, [
    ticker,
    chartType,
    isChartReady,
    selectedIndicators,
    timeframe,
    showTrends,
  ]);

  return (
    <div>
      <div ref={chartContainerRef} className="w-full h-full z-10" />
    </div>
  );
}
