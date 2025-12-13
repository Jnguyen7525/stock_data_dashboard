"use client";

import { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import { useChartStore } from "@/stores/chartStore";
import { useIndicatorStore } from "@/stores/useIndicatorStore";

import { StandardScaler } from "../ml-pipeline/featureBuilder";
import * as tf from "@tensorflow/tfjs";

import { useSearchStore } from "@/stores/useSearchStore";
import { useMLInference } from "@/hooks/useMLInference";
import { useCompareTickers } from "@/hooks/useCompareTickers";
import { useFetchChartData } from "@/hooks/useFetchChartData";
import { useIndicators } from "@/hooks/useIndicators";
import { usePatterns } from "@/hooks/usePatterns";
import { useSeriesManager } from "@/hooks/useSeriesManager";

interface Props {
  width: number;
  height: number;
  currentTicker: string;
  isMainChart: boolean;
}

type IndicatorRef = {
  series: any;
  paneIndex: number;
};

export default function Chart({
  width,
  height,
  currentTicker,
  isMainChart,
}: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<any>(null);
  const seriesTypeRef = useRef<string | null>(null);
  const overlayRefs = useRef<Record<string, any>>({});
  const volumeSeriesRef = useRef<any>(null);
  const indicatorRefs = useRef<Record<string, IndicatorRef>>({});
  const patternRefs = useRef<Record<string, any>>({});

  // const subPaneIndicators = new Set(["RSI", "MACD", "On-Balance Volume (OBV)"]);
  const subPaneIndicators = new Set([
    // Momentum / Oscillators
    "RSI",
    "MACD",
    "CCI",
    "Awesome Oscillator",
    "Rate of Change (ROC)",
    "TRIX",
    "Stochastic Oscillator",
    "Williams %R",
    "Stochastic RSI",
    "Know Sure Thing (KST)",
    "Ultimate Oscillator",
    "Detrended Price Oscillator (DPO)",
    "Price Oscillator",
    "Percentage Price Oscillator (PPO)",
    "ADX (Average Directional Index)",
    "Plus DM",
    "Minus DM",
    "Aroon Indicator",
    "Aroon Oscillator",

    // Volume-based
    "On-Balance Volume (OBV)",
    "Accumulation/Distribution Line (ADL)",
    "Force Index",
    "Money Flow Index (MFI)",
    "Volume Profile",

    "Average True Range (ATR)",
    "Volatility Index",
    "True Range",
  ]);
  let nextPaneIndexRef = useRef<number>(2);
  const prevTickerRef = useRef<string>("");
  const prevTimeframeRef = useRef<string>("");
  const prevDataRef = useRef<typeof candleStickData>([]);
  // !to track whether chart is the initial main chart or added later as added layout
  const currentState = useSearchStore((state) =>
    state.layoutTickers.find((l) => l.ticker === currentTicker)
  );

  //! only for mocking realtime with static data
  const currentIndexRef = useRef(50);

  const {
    chartType,
    ticker,
    timeframe,
    showTrends,
    candleStickData,
    setCandleStickData,
  } = useChartStore();
  const { selectedIndicators, selectedPatterns } = useIndicatorStore();
  const { comparedTickers, layoutTickers, setLayoutCandleData } =
    useSearchStore();

  const [isChartReady, setChartReady] = useState(false);

  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [scaler, setScaler] = useState<StandardScaler | null>(null);
  const [labels, setLabels] = useState<string[]>([]);

  // !loads the model
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

  //! Effect for resizing chart on window resize
  // 🔄 Resize chart when props change
  useEffect(() => {
    if (chartRef.current && width > 0 && height > 0) {
      chartRef.current.resize(width, height);
    }
  }, [width, height]);

  // !separate effects begining
  //! changes the chart type between candles and line
  useSeriesManager({
    chartRef,
    seriesRef,
    volumeSeriesRef,
    seriesTypeRef,
    isChartReady,
    isMainChart,
    chartType,
    candleStickData,
    currentState,
  });
  // //! fetches data to store in global state and for chart upon ticker changes and timeframe changes
  useFetchChartData({
    chartRef,
    isChartReady,
    ticker,
    currentTicker,
    isMainChart,
    setCandleStickData,
    setLayoutCandleData,
    currentState,
  });
  // !handles patterns
  usePatterns({
    chartRef,
    seriesRef,
    overlayRefs,
    isChartReady,
    ticker,
    isMainChart,
    candleStickData,
    selectedPatterns,
    currentState,
  });
  // !handles indicators
  useIndicators({
    chartRef,
    isChartReady,
    ticker,
    isMainChart,
    candleStickData,
    selectedIndicators,
    currentState,
    subPaneIndicators,
    nextPaneIndexRef,
    indicatorRefs,
  });
  // !handles compared tickers for same chart
  useCompareTickers({
    chartRef,
    isChartReady,
    isMainChart,
    comparedTickers,
    currentState,
    overlayRefs,
  });
  // !handles ml prediction
  useMLInference({
    chartRef,
    isChartReady,
    isMainChart,
    ticker,
    candleStickData,
    timeframe,
    showTrends,
    currentState,
    overlayRefs,
    prevTickerRef,
    prevDataRef,
    prevTimeframeRef,
    model,
    scaler,
    labels,
    seriesRef,
  });

  // function startRealtimeChartUpdates(
  //   priceData: any[],
  //   volumeDataSample: any[],
  //   seriesRef: React.MutableRefObject<any>,
  //   volumeSeriesRef: React.MutableRefObject<any>,
  //   currentIndexRef: React.MutableRefObject<number>,
  //   ticker: string,
  //   model: any,
  //   scaler: any,
  //   labels: any,
  //   showTrends: boolean,
  //   overlayRefs: React.MutableRefObject<Record<string, any>>,
  //   updateMLOverlays: (episodes: any[]) => void,
  //   subPaneIndicators: Set<string>,
  //   nextPaneIndex: number,
  //   indicatorRefs: React.MutableRefObject<Record<string, any>> // ✅ new parameter
  // ): NodeJS.Timeout {
  //   const intervalID = setInterval(() => {
  //     if (currentIndexRef.current >= priceData.length) {
  //       clearInterval(intervalID);
  //       return;
  //     }

  //     const p = priceData[currentIndexRef.current];
  //     const v = volumeDataSample[currentIndexRef.current];

  //     const nextPricePoint = {
  //       time: Number(p.time),
  //       open: p.open,
  //       high: p.high,
  //       low: p.low,
  //       close: p.close,
  //     };

  //     const nextVolumePoint = {
  //       time: Number(v.time),
  //       value: v.value,
  //       color: v.color,
  //     };

  //     try {
  //       seriesRef.current.update(nextPricePoint);
  //       volumeSeriesRef.current.update(nextVolumePoint);

  //       console.log("✅ Updated candlestick series with:", nextPricePoint);
  //       console.log("✅ Updated volume series with:", nextVolumePoint);

  //       // 🔎 Update indicators with all data so far
  //       const dataSoFar = priceData.slice(0, currentIndexRef.current + 1);
  //       const closeSeries = normalizeCloseSeries(dataSoFar);
  //       const closes = closeSeries.map((d) => d.value); // number[]

  //       addSelectedIndicators(
  //         selectedIndicators,
  //         closeSeries,
  //         // closes,
  //         dataSoFar,
  //         addLine,
  //         subPaneIndicators,
  //         nextPaneIndex,
  //         indicatorRefs // ✅ pass indicatorRefs here
  //       );

  //       // 🔎 Call ML overlay helper
  //       if (showTrends && model && scaler) {
  //         (async () => {
  //           const dataML = priceData.slice(0, currentIndexRef.current + 1);
  //           await runMLPredictionOverlay(
  //             dataML,
  //             ticker,
  //             model,
  //             scaler,
  //             labels,
  //             showTrends,
  //             overlayRefs,
  //             updateMLOverlays
  //           );
  //         })();
  //       }
  //     } catch (err) {
  //       console.error("❌ Chart update error:", err);
  //     }

  //     currentIndexRef.current++;
  //   }, 2000);

  //   return intervalID;
  // }

  // todo all effects separated

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
