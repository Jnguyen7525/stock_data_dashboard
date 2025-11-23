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

interface Props {
  width: number;
  height: number;
}

export default function Chart({ width, height }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<any>(null);
  const seriesTypeRef = useRef<string | null>(null);
  const overlayRefs = useRef<Record<string, any>>({});
  const volumeSeriesRef = useRef<any>(null);

  const { chartType, ticker, setChartSeries, timeframe, showTrends } =
    useChartStore();
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

  // 📈 Series + overlay update
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !isChartReady || !ticker) return;

    // Cleanup
    if (seriesRef.current && seriesTypeRef.current !== chartType) {
      chart.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }
    // Remove any line/candle series overlays
    Object.values(overlayRefs.current).forEach((overlay) => {
      // only remove if it's a series
      if (overlay && typeof overlay.setData === "function") {
        chart.removeSeries(overlay);
      }
      // if it's a marker plugin, detach instead
      if (overlay && typeof overlay.setMarkers === "function") {
        overlay.setMarkers([]); // clear markers
        overlay.detach(); // optional: fully detach
      }
    });

    overlayRefs.current = {};
    if (volumeSeriesRef.current) {
      chart.removeSeries(volumeSeriesRef.current);
      volumeSeriesRef.current = null;
    }

    // Create main series
    if (!seriesRef.current) {
      seriesRef.current =
        chartType === "line"
          ? chart.addSeries(LineSeries, { color: "#83ffe6" })
          : chart.addSeries(CandlestickSeries, {
              wickUpColor: "#83ffe6",
              upColor: "#83ffe6",
              wickDownColor: "#ff5f5f",
              downColor: "#ff5f5f",
            });
      seriesTypeRef.current = chartType;
    }

    const updateChartData = async () => {
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

        const mainSeriesData =
          chartType === "line"
            ? data.map((d: { time: number; close: number }) => ({
                time: d.time,
                value: d.close,
              }))
            : data;

        seriesRef.current.setData(mainSeriesData);
        chart.timeScale().fitContent();
        setChartSeries(ticker, data);

        // 🔻 Volume pane
        const volumeData = data.map(
          (d: {
            time: string;
            volume: number;
            close: number;
            open: number;
          }) => ({
            time: d.time,
            value: d.volume,
            color: d.close >= d.open ? "#c2b0ff" : "#fd0054",
          })
        );

        if (!volumeSeriesRef.current) {
          volumeSeriesRef.current = chart.addSeries(
            HistogramSeries,
            {
              color: "#26a69a",
              priceFormat: { type: "volume" },
              priceScaleId: "",
            },
            1
          );
          volumeSeriesRef.current.setData(volumeData);
        }

        // 🔍 Indicator overlays
        const closeSeries = normalizeCloseSeries(data);
        const subPaneIndicators = new Set(["RSI", "MACD", "OBV"]);
        let nextPaneIndex = 2;

        const addLine = (
          key: string,
          data: any[],
          color: string,
          paneIndex = 0
        ) => {
          const safe = filterValidPoints(data);
          if (safe.length === 0) return;
          const line = chart.addSeries(
            LineSeries,
            { color, lineWidth: 2 },
            paneIndex
          );
          line.setData(
            safe as unknown as (LineData<Time> | WhitespaceData<Time>)[]
          );
          overlayRefs.current[key] = line;
        };

        selectedIndicators.forEach((indicator) => {
          const isSubPane = subPaneIndicators.has(indicator);
          const paneIndex = isSubPane ? nextPaneIndex++ : 0;

          switch (indicator) {
            case "Simple Moving Average":
              addLine(
                indicator,
                computeSMA(closeSeries, 14),
                "#ffa500",
                paneIndex
              );
              break;
            case "Exponential Moving Average":
              addLine(
                indicator,
                computeEMA(closeSeries, 14),
                "#ff66cc",
                paneIndex
              );
              break;
            case "Weighted Moving Average":
              addLine(
                indicator,
                computeWMA(closeSeries, 14),
                "#66ccff",
                paneIndex
              );
              break;
            case "RSI":
              addLine(
                indicator,
                computeRSI(closeSeries, 14),
                "#00ffcc",
                paneIndex
              );
              break;
            case "MACD": {
              const { macd, signal, histogram } = computeMACD(closeSeries);
              addLine("MACD Line", macd, "#ffcc00", paneIndex);
              addLine("MACD Signal", signal, "#ff66cc", paneIndex);
              addLine("MACD Histogram", histogram, "#999999", paneIndex);
              break;
            }
            case "OBV":
              addLine(
                indicator,
                computeOBV(
                  data.map(
                    (d: { time: string; close: number; volume: number }) => ({
                      time: d.time,
                      value: d.close,
                      volume: d.volume,
                    })
                  )
                ),
                "#ccff66",
                paneIndex
              );
              break;
            case "VWAP":
              addLine(
                indicator,
                computeVWAP(
                  data.map(
                    (d: { time: string; close: number; volume: number }) => ({
                      time: d.time,
                      value: d.close,
                      volume: d.volume,
                    })
                  )
                ),
                "#ff9966",
                paneIndex
              );
              break;
            case "Bollinger Bands": {
              const bands = computeBollingerBands(closeSeries, 20, 2);
              addLine(
                "BB Upper",
                bands.map((d) => ({ time: d.time, value: d.upper })),
                "#ff6666",
                paneIndex
              );
              addLine(
                "BB Middle",
                bands.map((d) => ({ time: d.time, value: d.middle })),
                "#cccccc",
                paneIndex
              );
              addLine(
                "BB Lower",
                bands.map((d) => ({ time: d.time, value: d.lower })),
                "#6666ff",
                paneIndex
              );
              break;
            }
          }
        });

        // 📍 ML Prediction Overlay
        // If trends are disabled, clear any existing markers + overlays
        if (!showTrends || !model || !scaler) {
          // clear markers plugin if we created one earlier
          const markerPrimitive = overlayRefs.current["MLMarkers"];
          if (markerPrimitive) {
            markerPrimitive.setMarkers([]); // remove all markers
            delete overlayRefs.current["MLMarkers"];
          }

          return;
        }

        // 1️⃣ Prepare base OHLCV series
        const offsetML = new Date().getTimezoneOffset() * 60;
        const dataML = raw
          .map((d: any) => ({
            time: new Date(d.time).getTime() / 1000 - offsetML,
            open: Number(d.open),
            high: Number(d.high),
            low: Number(d.low),
            close: Number(d.close),
            volume: Number(d.volume),
          }))
          .sort((a: { time: number }, b: { time: number }) => a.time - b.time);

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
        const bbMap = idx(
          bbSeries as unknown as { time: number; value: number }[]
        );
        const vwapMap = idx(vwapSeries as { time: number; value: number }[]);
        const obvMap = idx(obvSeries as { time: number; value: number }[]);

        const enrichedBars: RawRow[] = dataML.map((d: any) => {
          const bb = bbMap.get(d.time) as unknown as {
            upper: number;
            middle: number;
            lower: number;
          };
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
        const confidenceThreshold = 0.7; // tune this (0.6–0.8 is common)
        const filteredEpisodes = episodes.filter(
          (ep) => ep.confidence >= confidenceThreshold
        );

        console.log(
          `✅ Using ${filteredEpisodes.length}/${episodes.length} episodes above confidence=${confidenceThreshold}`
        );

        // 4️⃣ Overlay markers + dashed lines
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
            text: `End: ${labelStr} | ${ep.episode.duration} bars | Conf ${(
              ep.confidence * 100
            ).toFixed(1)}%`,
          });
        });

        // ✅ Create markers and store plugin reference
        if (showTrends) {
          const markerPrimitive = createSeriesMarkers(
            seriesRef.current,
            markers
          );
          overlayRefs.current["MLMarkers"] = markerPrimitive;
        } else {
          return;
        }
      } catch (err) {
        console.error("[Fetch] Failed to fetch chart data:", err);
      }
    };

    updateChartData();
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
