import { patternDetectors } from "@/lib/chartUtils";
import { createSeriesMarkers } from "lightweight-charts";
import { useEffect } from "react";

export function usePatterns({
  chartRef,
  seriesRef,
  overlayRefs,
  isChartReady,
  ticker,
  isMainChart,
  candleStickData,
  selectedPatterns,
  currentState,
}: any) {
  useEffect(() => {
    if (!chartRef.current || !seriesRef.current || !isChartReady || !ticker)
      return;

    const patterns = isMainChart
      ? selectedPatterns
      : currentState!.selectedPatterns;
    const data = isMainChart ? candleStickData : currentState?.candleStickData;

    // Clear old markers
    if (overlayRefs.current["PatternMarkers"]) {
      overlayRefs.current["PatternMarkers"].setMarkers([]);
      delete overlayRefs.current["PatternMarkers"];
    }

    if (patterns.length > 0) {
      const primitive = createSeriesMarkers(seriesRef.current, []);
      const candleData = data.map((c: any, i: number) => ({
        ...c,
        index: i,
      }));

      const allMarkers: any[] = [];

      patterns.forEach((pattern: string) => {
        const detector = patternDetectors[pattern];
        if (!detector) return;

        const result = detector({ candles: candleData });
        const matches = result
          .map((flag: boolean, i: number) =>
            flag ? { time: candleData[i].time, index: i } : null
          )
          .filter(Boolean);

        matches.forEach((m) => {
          allMarkers.push({
            time: m!.time,
            position: "aboveBar",
            color: "purple",
            shape: "circle",
            text: pattern,
          });
        });
      });

      primitive.setMarkers(allMarkers);
      overlayRefs.current["PatternMarkers"] = primitive;
    }
  }, [selectedPatterns, candleStickData, ticker, isChartReady, currentState]);
}
