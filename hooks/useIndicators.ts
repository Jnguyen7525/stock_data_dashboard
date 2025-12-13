import {
  addLine,
  addSelectedIndicators,
  removeUnselectedIndicators,
} from "@/lib/chartUtils";
import { useEffect } from "react";

import { normalizeCloseSeries } from "@/lib/indicatorUtils";

export function useIndicators({
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
}: any) {
  useEffect(() => {
    if (!chartRef.current || !isChartReady || !ticker) return;
    const chart = chartRef.current;

    const closeSeries = normalizeCloseSeries(
      isMainChart ? candleStickData : currentState?.candleStickData!
    );

    const indicators = isMainChart
      ? selectedIndicators
      : currentState?.selectedIndicators!;

    addSelectedIndicators(
      indicators,
      closeSeries,
      isMainChart ? candleStickData : currentState?.candleStickData!,
      (key: string, data: any[], color: string, paneIndex?: number) =>
        addLine(
          key,
          data,
          color,
          paneIndex,
          chartRef,
          isChartReady,
          indicatorRefs
        ),
      subPaneIndicators,
      nextPaneIndexRef.current,
      indicatorRefs
    );

    removeUnselectedIndicators(indicators, chart, indicatorRefs);
  }, [selectedIndicators, candleStickData, ticker, isChartReady, currentState]);
}
