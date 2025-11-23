"use client";

import { Timeframe, useChartStore } from "@/stores/chartStore";
import { useIndicatorStore } from "@/stores/useIndicatorStore";
import { useSearchStore } from "@/stores/useSearchStore";
import {
  BarChart3,
  Clock,
  LineChart,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function ChartToolbar() {
  const {
    setChartType,
    timeframe,
    setTimeframe,
    toggleSidebar,
    sidebarOpen,
    setShowTrends,
  } = useChartStore();
  const currentTicker = useChartStore((s) => s.ticker);

  const { filterTickers, setAllTickers } = useSearchStore();
  const { allIndicators, selectedIndicators, setAllIndicators, addIndicator } =
    useIndicatorStore();

  const [input, setInput] = useState(currentTicker);
  const [showDropdown, setShowDropdown] = useState(false);

  const [openDropdown, setOpenDropdown] = useState<
    null | "indicator" | "timeframe" | "chart"
  >(null);

  const toggleDropdown = (name: "indicator" | "timeframe" | "chart") => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Load tickers.json
  useEffect(() => {
    const loadTickers = async () => {
      const res = await fetch("/tickers.json");
      const data = await res.json();
      setAllTickers(data);
    };
    loadTickers();
  }, []);

  // Load indicators.json
  useEffect(() => {
    const loadIndicators = async () => {
      const res = await fetch("/indicators.json");
      const data = await res.json();
      setAllIndicators(data);
    };
    loadIndicators();
  }, []);

  // Debounce input
  useEffect(() => {
    const timeout = setTimeout(() => {
      const isTyping = input.length > 0 && input !== currentTicker;
      if (isTyping) {
        filterTickers(input);
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [input, currentTicker]);

  const handleAddIndicator = (name: string) => {
    if (name && !selectedIndicators.includes(name)) {
      addIndicator(name);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row w-full justify-start items-center sm:gap-5 px-3 bg-[#2c2c2c] rounded text-white relative">
      <div className="text-[#83ffe6] font-bold tracking-wide text-xl underline underline-offset-4">
        {currentTicker ? `${currentTicker}` : ""}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowTrends()}
          className="bg-[#c2b0ff] text-[#2c2c2c] px-2 py-1 rounded-lg hover:opacity-50 cursor-pointer"
        >
          See Trends
        </button>

        {/* Indicator Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("indicator")}
            className="p-2 rounded hover:opacity-50 cursor-pointer"
          >
            <BarChart3 className="w-5 h-5 text-white " />
          </button>
          {openDropdown === "indicator" && (
            <ul className="absolute top-full left-0 mt-2 bg-[#2c2c2c] text-white rounded shadow z-50 w-40">
              <li
                className="px-3 py-2 hover:opacity-50  cursor-pointer"
                onClick={() => handleAddIndicator("")}
              >
                Add Indicator
              </li>
              {allIndicators.map((ind, i) => (
                <li
                  key={`${ind.name}-${i}`}
                  className="px-3 py-2 hover:opacity-50  cursor-pointer"
                  onClick={() => {
                    handleAddIndicator(ind.name);
                    setOpenDropdown(null);
                  }}
                >
                  {ind.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Timeframe Dropdown Trigger */}
        <div className="relative flex items-center gap-2 p-2 rounded group cursor-pointer">
          <div
            className="flex gap-2 items-center group-hover:opacity-50"
            onClick={() => toggleDropdown("timeframe")}
          >
            <span className="text-sm text-white group-hover:opacity-50 cursor-pointer">
              {timeframe}
            </span>

            <Clock className="w-5 h-5 text-white" />
          </div>
          {openDropdown === "timeframe" && (
            <ul className="absolute top-full left-0 mt-2 bg-[#2c2c2c] text-white rounded shadow z-50 w-28">
              {["1Min", "5Min", "15Min", "30Min", "1H", "1D"].map((tf) => (
                <li
                  key={tf}
                  className="px-3 py-2 hover:opacity-50  cursor-pointer"
                  onClick={() => {
                    setTimeframe(tf as Timeframe);
                    setOpenDropdown(null);
                  }}
                >
                  {tf}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Chart Type Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("chart")}
            className="p-2 rounded hover:opacity-50 cursor-pointer"
          >
            <LineChart className="w-5 h-5 text-white" />
          </button>
          {openDropdown === "chart" && (
            <ul className="absolute top-full -left-15 sm:left-0 mt-2 bg-[#2c2c2c] text-white rounded shadow z-50 w-40">
              <li
                className="px-3 py-2 hover:opacity-50  cursor-pointer"
                onClick={() => {
                  setChartType("line");
                  setOpenDropdown(null);
                }}
              >
                Line Chart
              </li>
              <li
                className="px-3 py-2 hover:opacity-50  cursor-pointer"
                onClick={() => {
                  setChartType("candlestick");
                  setOpenDropdown(null);
                }}
              >
                Candlestick Chart
              </li>
            </ul>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className={`sm:absolute right-0 p-1 mr-1 rounded  text-black hover:opacity-50 cursor-pointer transition-transform ${
            sidebarOpen ? "bg-[#ff5f5f]" : "bg-[#83ffe6]"
          }`}
        >
          {sidebarOpen ? (
            <PanelRightClose className="w-5 h-5" />
          ) : (
            <PanelRightOpen className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
