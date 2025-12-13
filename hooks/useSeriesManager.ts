import { useEffect } from "react";
import {
  LineSeries,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";

interface UseSeriesManagerProps {
  chartRef: React.MutableRefObject<any>;
  seriesRef: React.MutableRefObject<any>;
  volumeSeriesRef: React.MutableRefObject<any>;
  seriesTypeRef: React.MutableRefObject<string | null>;
  isChartReady: boolean;
  isMainChart: boolean;
  chartType: "line" | "candlestick";
  candleStickData: any[];
  currentState?: { chartType: "line" | "candlestick"; candleStickData: any[] };
}

export function useSeriesManager({
  chartRef,
  seriesRef,
  volumeSeriesRef,
  seriesTypeRef,
  isChartReady,
  isMainChart,
  chartType,
  candleStickData,
  currentState,
}: UseSeriesManagerProps) {
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !isChartReady) return;

    const activeChartType = isMainChart ? chartType : currentState?.chartType;
    const activeData = isMainChart
      ? candleStickData
      : currentState?.candleStickData;

    if (!activeChartType || !activeData) return;

    // Create or switch main series
    if (!seriesRef.current || seriesTypeRef.current !== activeChartType) {
      const oldSeries = seriesRef.current;

      seriesRef.current =
        activeChartType === "line"
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

      seriesTypeRef.current = activeChartType;
      oldSeries && chart.removeSeries(oldSeries);
    }

    // Create or switch volume series
    if (!volumeSeriesRef.current || seriesTypeRef.current !== activeChartType) {
      const oldVolumeSeries = volumeSeriesRef.current;

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

    // Prepare data
    const mainSeriesData =
      activeChartType === "line"
        ? activeData.map((d: { time: number; close: number }) => ({
            time: d.time,
            value: d.close,
          }))
        : activeData;

    seriesRef.current.setData(mainSeriesData);

    const volumeData = activeData.map(
      (d: { time: number; volume: number; close: number; open: number }) => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? "#c2b0ff" : "#fd0054",
      })
    );

    volumeSeriesRef.current.setData(volumeData);

    chart.timeScale().fitContent();
  }, [isChartReady, isMainChart, chartType, candleStickData, currentState]);
}
