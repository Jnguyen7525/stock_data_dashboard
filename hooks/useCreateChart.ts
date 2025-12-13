import { useEffect, useState, useRef } from "react";
import { createChart } from "lightweight-charts";

export function useCreateChart(width: number, height: number) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const [isChartReady, setChartReady] = useState(false);

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

  return { chartContainerRef, chartRef, isChartReady };
}
