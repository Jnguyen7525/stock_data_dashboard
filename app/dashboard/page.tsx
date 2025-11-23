"use client";

import { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import ChartToolbar from "../components/ChartToolbar";
import SelectedIndicators from "../components/SelectedIndicators";
import Chart from "../components/Chart";
import Sidebar from "../components/Sidebar";
import { useChartStore } from "@/stores/chartStore";

export default function Dashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { sidebarOpen } = useChartStore();

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
    <main className="bg-[#2c2c2c] text-white max-w-[100vw] w-screen min-h-screen max-h-screen h-auto flex flex-col relative  ">
      <Header />

      {/* Main content area */}
      <div className="flex flex-1 min-h-0 max-w-[100vw] relative overflow-hidden">
        {/* Chart area (70%) */}
        <div
          className={`z-0 ${
            sidebarOpen
              ? "w-[70%] flex flex-col min-h-0"
              : "w-full flex flex-col min-h-0"
          } `}
        >
          {/* chart top bar */}
          <ChartToolbar />
          <SelectedIndicators />
          {/* Chart container */}
          <div
            ref={containerRef}
            className="flex-1 min-h-0 p-6 overflow-hidden relative"
          >
            <Chart width={size.width} height={size.height} />
          </div>
        </div>
        <div
          className={`absolute top-0 right-0 h-full w-full overflow-hidden bg-[#2c2c2c] transition-transform duration-300 ease-in-out px-3
      ${
        sidebarOpen
          ? "translate-x-0 sm:w-[30%] sm:max-w-[30%]"
          : "translate-x-full sm:translate-x-full sm:w-0"
      }`}
          style={{ width: sidebarOpen ? "100%" : "0" }} // mobile overlay width
        >
          <Sidebar />
        </div>
      </div>
    </main>
  );
}
