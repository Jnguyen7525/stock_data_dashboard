"use client";

import { useEffect, useRef, useState } from "react";
import ChartToolbar from "../components/ChartToolbar";
import SelectedIndicators from "../components/SelectedIndicators";
import Chart from "../components/Chart";
import Sidebar from "../components/Sidebar";
import { useChartStore } from "@/stores/chartStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

export default function Dashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { toggleSidebar, sidebarOpen, ticker } = useChartStore();
  const { layoutTickers } = useSearchStore();

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
    <main className="bg-[#2c2c2c] text-white max-w-[100vw] w-screen min-h-screen max-h-screen h-auto flex flex-col relative">
      {/* Main content area */}
      <div className="flex flex-1 min-h-screen max-h-screen max-w-[100vw] relative overflow-hidden p-2">
        {/* Chart area (70%) */}
        <div
          className={`z-0 ${
            sidebarOpen
              ? "w-[70%] flex flex-col min-h-0"
              : "w-full flex flex-col min-h-0"
          } `}
        >
          <div
            className={`flex w-full h-full ${
              layoutTickers.length > 0
                ? "flex-col sm:flex-row sm:overflow-y-auto"
                : ""
            }`}
          >
            {/* Main chart */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
              <ChartToolbar ticker={ticker} isMainChart={true} />
              <SelectedIndicators ticker={ticker} isMainChart={true} />
              <div
                ref={containerRef}
                className="flex-1 min-h-0 overflow-hidden relative"
              >
                <Chart
                  width={size.width}
                  height={size.height}
                  currentTicker={ticker}
                  isMainChart={true}
                />
              </div>
            </div>

            {/* Layout tickers */}
            {layoutTickers.map((lt) => (
              <div
                key={lt.ticker}
                className="flex-1 min-h-0 flex flex-col overflow-hidden relative"
              >
                <ChartToolbar ticker={lt.ticker} isMainChart={false} />
                <SelectedIndicators ticker={lt.ticker} isMainChart={false} />
                <div
                  // ref={containerRef}
                  className="flex-1 min-h-0 overflow-hidden relative"
                >
                  <Chart
                    width={size.width}
                    height={size.height}
                    currentTicker={lt.ticker}
                    isMainChart={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={toggleSidebar}
          className={`rounded-xs opacity-60 border border-[#83ffe6] hover:opacity-100 cursor-pointer transition-transform ${
            sidebarOpen
              ? "text-[#ff5f5f] border-[#ff5f5f]"
              : "text-[#83ffe6] border-[#83ffe6]"
          }`}
        >
          {sidebarOpen ? (
            <div className="flex flex-col h-full items-center justify-between ">
              <ChevronsRight className="w-2" />
              <ChevronsRight className="w-2" />
              <ChevronsRight className="w-2" />
              <ChevronsRight className="w-2" />
              <ChevronsRight className="w-2" />
              <ChevronsRight className="w-2" />
              <ChevronsRight className="w-2" />
              <ChevronsRight className="w-2" />
              <ChevronsRight className="w-2" />
              <ChevronsRight className="w-2" />
              <ChevronsRight className="w-2" />
              <ChevronsRight className="w-2" />
            </div>
          ) : (
            <div className="flex flex-col h-full items-center justify-between ">
              <ChevronsLeft className="w-2" />
              <ChevronsLeft className="w-2" />
              <ChevronsLeft className="w-2" />
              <ChevronsLeft className="w-2" />
              <ChevronsLeft className="w-2" />
              <ChevronsLeft className="w-2" />
              <ChevronsLeft className="w-2" />
              <ChevronsLeft className="w-2" />
              <ChevronsLeft className="w-2" />
              <ChevronsLeft className="w-2" />
              <ChevronsLeft className="w-2" />
              <ChevronsLeft className="w-2" />
            </div>
          )}
        </button>
        <div
          className={`absolute sm:relative p-3 sm:p-0 top-0 right-0 h-full w-full overflow-hidden bg-[#2c2c2c] transition-transform duration-300 ease-in-out 
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
