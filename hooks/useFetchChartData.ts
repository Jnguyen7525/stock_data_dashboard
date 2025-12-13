import { useChartStore } from "@/stores/chartStore";
import { useEffect } from "react";

export function useFetchChartData({
  chartRef,
  isChartReady,
  ticker,
  currentTicker,
  isMainChart,
  setCandleStickData,
  setLayoutCandleData,
  currentState,
}: {
  chartRef: React.MutableRefObject<any>;
  isChartReady: boolean;
  ticker: string;
  currentTicker: string;
  isMainChart: boolean;
  setCandleStickData: (data: any[]) => void;
  setLayoutCandleData: (ticker: string, data: any[]) => void;
  currentState?: { timeframe: string };
}) {
  const { timeframe } = useChartStore.getState();
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !isChartReady || !ticker) return;

    const fetchChartData = async () => {
      try {
        const tf = isMainChart ? timeframe : currentState?.timeframe;
        const res = await fetch(
          `/api/alpaca/bars?ticker=${currentTicker}&timeframe=${tf}`
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

        if (isMainChart) {
          setCandleStickData(data);
        } else {
          setLayoutCandleData(currentTicker, data);
        }
      } catch (err) {
        console.error("[Fetch] Failed to fetch chart data:", err);
      }
    };

    fetchChartData();
  }, [ticker, isChartReady, timeframe, currentState?.timeframe]);
}
