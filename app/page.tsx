"use client";

import Header from "./components/Header";
import { useEffect, useRef, useState } from "react";
import ChartToolbar from "./components/ChartToolbar";
import { useSearchStore } from "@/stores/useSearchStore";
import SelectedIndicators from "./components/SelectedIndicators";
import Chart from "./components/Chart";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const setAllTickers = useSearchStore((s) => s.setAllTickers);

  useEffect(() => {
    const loadTickers = async () => {
      const res = await fetch("/tickers.json");
      const data = await res.json();
      console.log("Loaded tickers:", data.length); // ✅ should show a number
      setAllTickers(data);
    };

    loadTickers();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <main className="bg-[#2c2c2c] text-white max-w-[100vw] w-screen min-h-screen max-h-screen h-auto flex flex-col relative overflow-hidden ">
      <Header />

      {/* chart top bar */}
      <ChartToolbar />
      <SelectedIndicators />

      <div
        ref={containerRef}
        className="flex-1 p-6 flex w-full h-full overflow-auto"
      >
        <Chart width={size.width} height={size.height} />
      </div>
    </main>
  );
}
