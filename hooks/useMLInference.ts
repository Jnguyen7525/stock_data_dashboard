import { runMLPredictionOverlay, updateMLOverlays } from "@/lib/chartUtils";
import { useEffect } from "react";

export function useMLInference({
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
}: any) {
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !isChartReady || !ticker) return;

    const activeTicker = isMainChart ? ticker : currentState?.ticker;
    const activeData = isMainChart
      ? candleStickData
      : currentState?.candleStickData;
    const activeTimeframe = isMainChart ? timeframe : currentState?.timeframe;
    const activeShowTrends = isMainChart
      ? showTrends
      : currentState?.showTrends;

    if (
      !activeShowTrends ||
      prevTickerRef.current !== activeTicker ||
      prevDataRef.current !== activeData ||
      prevTimeframeRef.current !== activeTimeframe
    ) {
      Object.keys(overlayRefs.current)
        .filter((key) => key.startsWith("ML Dashed") || key === "MLMarkers")
        .forEach((key) => {
          const overlay = overlayRefs.current[key];
          if (overlay && typeof overlay.setData === "function") {
            chart.removeSeries(overlay);
          } else if (overlay && typeof overlay.setMarkers === "function") {
            overlay.setMarkers([]);
          }
          delete overlayRefs.current[key];
        });

      prevTickerRef.current = activeTicker;
      prevDataRef.current = activeData;
      prevTimeframeRef.current = activeTimeframe;
    }

    runMLPredictionOverlay(
      activeData,
      activeTicker,
      model,
      scaler,
      labels,
      activeShowTrends,
      overlayRefs,
      (episodes) =>
        updateMLOverlays(
          chartRef,
          isChartReady,
          overlayRefs,
          seriesRef,
          episodes
        )
    );
  }, [
    showTrends,
    ticker,
    timeframe,
    candleStickData,
    currentState?.showTrends,
  ]);
}
