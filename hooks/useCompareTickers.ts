import { useEffect } from "react";
import { PriceScaleMode } from "lightweight-charts";
import { normalizeCloseSeries } from "@/lib/indicatorUtils";
import { useChartStore } from "@/stores/chartStore";
import { addLine } from "@/lib/chartUtils";

export function useCompareTickers({
  chartRef,
  isChartReady,
  isMainChart,
  comparedTickers,
  currentState,
  overlayRefs,
}: {
  chartRef: React.MutableRefObject<any>;
  isChartReady: boolean;
  isMainChart: boolean;
  comparedTickers: string[];
  currentState?: { compareTickers: string[] };
  overlayRefs: React.MutableRefObject<Record<string, any>>;
}) {
  useEffect(() => {
    const chart = chartRef.current;
    if (!chartRef.current || !isChartReady) return;

    // Remove all compare series
    Object.keys(overlayRefs.current).forEach((key) => {
      if (key.startsWith("compare-")) {
        chart.removeSeries(overlayRefs.current[key]);
        delete overlayRefs.current[key];
      }
    });

    const tickers = isMainChart
      ? comparedTickers
      : (currentState?.compareTickers ?? []);

    // Switch axis mode
    chart.priceScale("right").applyOptions({
      mode:
        tickers.length > 0 ? PriceScaleMode.Percentage : PriceScaleMode.Normal,
    });

    // Re‑add compare tickers
    tickers.forEach(async (cmp) => {
      try {
        const { timeframe } = useChartStore.getState();
        const res = await fetch(
          `/api/alpaca/bars?ticker=${cmp}&timeframe=${timeframe}`
        );
        const raw = await res.json();

        const offset = new Date().getTimezoneOffset() * 60;
        const data = raw
          .map((d: any) => ({
            time: new Date(d.time).getTime() / 1000 - offset,
            open: parseFloat(d.open),
            high: parseFloat(d.high),
            low: parseFloat(d.low),
            close: parseFloat(d.close),
            volume: parseFloat(d.volume),
          }))
          .sort((a: any, b: any) => a.time - b.time);

        const series = addLine(
          `compare-${cmp}`,
          normalizeCloseSeries(data),
          "#ff9900",
          0,
          chartRef, // pass chartRef
          isChartReady, // pass readiness flag
          overlayRefs // pass overlayRefs
        );
        overlayRefs.current[`compare-${cmp}`] = series;
      } catch (err) {
        console.error(`[Fetch] Failed to fetch compare data for ${cmp}:`, err);
      }
    });
  }, [comparedTickers, isChartReady, currentState]);
}
