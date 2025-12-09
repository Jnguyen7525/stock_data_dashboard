"use client";

import { getAvailableIndicators } from "@/lib/indicators/index";
import { Timeframe, useChartStore } from "@/stores/chartStore";
import { useIndicatorStore } from "@/stores/useIndicatorStore";
import { useSearchStore } from "@/stores/useSearchStore";
import {
  BrainCog,
  ChartCandlestick,
  CirclePlus,
  Clock,
  LayoutGrid,
  LineChart,
  PanelRightClose,
  PanelRightOpen,
  SquareFunctionIcon,
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

  const {
    filterTickers,
    setAllTickers,
    allTickers,
    comparedTickers,
    layoutTickers,
    addCompare,
    addLayout,
  } = useSearchStore();

  const {
    allIndicators,
    selectedIndicators,
    setAllIndicators,
    addIndicator,
    allPatterns,
    setAllPatterns,
    selectedPatterns,
    addPattern,
  } = useIndicatorStore();

  const [input, setInput] = useState(currentTicker);
  const [showDropdown, setShowDropdown] = useState(false);

  const [openDropdown, setOpenDropdown] = useState<
    | null
    | "indicator"
    | "timeframe"
    | "chart"
    | "ml"
    | "patterns"
    | "compare"
    | "layout"
  >(null);

  const [searchIndicators, setSearchIndicators] = useState<string>("");
  const [searchPatterns, setSearchPatterns] = useState<string>("");
  const [searchCompare, setSearchCompare] = useState("");
  const [searchLayouts, setSearchLayouts] = useState("");

  const toggleDropdown = (
    name:
      | "indicator"
      | "timeframe"
      | "chart"
      | "ml"
      | "patterns"
      | "compare"
      | "layout"
  ) => {
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

    loadTickers();
  }, []);

  // Load indicators.json
  useEffect(() => {
    const loadIndicators = async () => {
      const res = await fetch("/indicators.json");
      const data = await res.json();
      const availableIndicators = getAvailableIndicators();
      console.log(`list of indicators: `, availableIndicators);
      setAllIndicators(data);
    };
    const loadPatterns = async () => {
      const res = await fetch("/patterns.json");
      const data = await res.json();
      setAllPatterns(data);
    };
    loadIndicators();
    loadPatterns();
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
      console.log(`adding indicator in toolbar: ${name}`);
      addIndicator(name);
    }
  };

  const handleAddPattern = (name: string) => {
    if (name && !selectedPatterns.includes(name)) {
      console.log(`adding indicator in toolbar: ${name}`);
      addPattern(name);
    }
  };

  const handleAddCompare = (name: string) => {
    if (name && !comparedTickers.includes(name)) {
      console.log(`adding indicator in toolbar: ${name}`);
      addCompare(name);
    }
  };

  const handleAddLayout = (name: string, dir: string = "right") => {
    const exists = layoutTickers.some((l) => l.ticker === name);
    if (name && !exists) {
      console.log(`adding layout ticker: ${name} with dir: ${dir}`);
      addLayout(name, dir);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row w-full justify-start items-center sm:gap-5 px-3 bg-[#2c2c2c] rounded text-white relative">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="text-[#83ffe6] font-bold tracking-wide sm:text-lg underline underline-offset-4">
          {currentTicker ? `${currentTicker}` : ""}
        </div>
        <div className="relative">
          <button
            onClick={() => toggleDropdown("ml")}
            className="bg-[#c2b0ff] text-[#2c2c2c] p-0.5 rounded-lg hover:opacity-50 cursor-pointer"
          >
            {/* See Trends */}
            <BrainCog className="w-5 h-5" />
          </button>
          {openDropdown === "ml" && (
            <ul className="absolute top-full left-0 mt-2 bg-[#c2b0ff] text-[#2c2c2c] rounded-sm shadow z-50 flex w-36">
              {["Classify Trends"].map((ml) => (
                <li
                  key={ml}
                  className="px-3 py-2 w-fit hover:opacity-50 cursor-pointer"
                  onClick={() => {
                    setShowTrends();
                    setOpenDropdown(null);
                  }}
                >
                  {ml}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Indicator Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("indicator")}
            className="p-2 rounded hover:opacity-50 cursor-pointer flex items-center"
          >
            <SquareFunctionIcon className="w-5 h-5 text-white" />
          </button>

          {openDropdown === "indicator" && (
            <ul className="absolute top-full left-0 mt-2 bg-[#2c2c2c] text-white rounded shadow z-50 w-64 overflow-y-auto max-h-[50vh]">
              {/* Search input */}
              <li className="px-2 py-2">
                <input
                  type="text"
                  placeholder="Search indicators..."
                  value={searchIndicators}
                  onChange={(e) => setSearchIndicators(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#1c1c1c] text-white focus:outline-none"
                />
              </li>

              {/* Add Indicator option */}
              {/* Filtered list */}
              {allIndicators
                .filter((ind) =>
                  searchIndicators === ""
                    ? true
                    : ind.name
                        .toLowerCase()
                        .includes(searchIndicators.toLowerCase())
                )
                .map((ind, i) => (
                  <li
                    key={`${ind.name}-${i}`}
                    className="px-2 py-1 hover:opacity-50 cursor-pointer"
                    onClick={() => {
                      handleAddIndicator(ind.name);
                      setOpenDropdown(null);
                      setSearchIndicators(""); // reset search after selection
                    }}
                  >
                    {ind.name}
                  </li>
                ))}
            </ul>
          )}
        </div>
        {/* candlestick patterns dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("patterns")}
            className="p-2 rounded hover:opacity-50 cursor-pointer flex items-center"
          >
            <ChartCandlestick className="w-5 h-5 text-white" />
          </button>
          {openDropdown === "patterns" && (
            <ul className="absolute top-full left-0 mt-2 bg-[#2c2c2c] text-white rounded shadow z-50 w-64 overflow-y-auto max-h-[50vh]">
              {/* Search input */}
              <li className="px-2 py-2">
                <input
                  type="text"
                  placeholder="Search patterns..."
                  value={searchPatterns}
                  onChange={(e) => setSearchPatterns(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#1c1c1c] text-white focus:outline-none"
                />
              </li>

              {/* Add Indicator option */}
              {/* Filtered list */}
              {allPatterns
                .filter((pat) =>
                  searchPatterns === ""
                    ? true
                    : pat.name
                        .toLowerCase()
                        .includes(searchPatterns.toLowerCase())
                )
                .map((pat, i) => (
                  <li
                    key={`${pat.name}-${i}`}
                    className="px-2 py-1 hover:opacity-50 cursor-pointer"
                    onClick={() => {
                      handleAddPattern(pat.name);
                      setOpenDropdown(null);
                      setSearchPatterns(""); // reset search after selection
                    }}
                  >
                    {pat.name}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* compare tickers dropdown */}
        {/* compare tickers dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("compare")}
            className="p-2 rounded hover:opacity-50 cursor-pointer flex items-center"
          >
            <CirclePlus className="w-5 h-5 text-white" />
          </button>

          {openDropdown === "compare" && (
            <ul className="absolute top-full left-0 mt-2 bg-[#2c2c2c] text-white rounded shadow z-50 w-64 overflow-y-auto max-h-[50vh]">
              {/* Search input */}
              <li className="px-2 py-2">
                <input
                  type="text"
                  placeholder="Search tickers to compare..."
                  value={searchCompare}
                  onChange={(e) =>
                    setSearchCompare(e.target.value.toUpperCase())
                  }
                  className="w-full px-2 py-1 rounded bg-[#1c1c1c] text-white focus:outline-none"
                />
              </li>

              {/* Only show filtered list if user typed something */}
              {searchCompare !== "" &&
                allTickers
                  .filter((t) =>
                    t.ticker.toLowerCase().includes(searchCompare.toLowerCase())
                  )
                  .map((t, i) => (
                    <li
                      key={`${t.ticker}-${i}`}
                      className="px-2 py-1 hover:opacity-50 cursor-pointer"
                      onClick={() => {
                        handleAddCompare(t.ticker);
                        setOpenDropdown(null);
                        setSearchCompare(""); // reset search
                      }}
                    >
                      {t.ticker} ({t.exchange})
                    </li>
                  ))}
            </ul>
          )}
        </div>
        {/* multiple charts */}
        {/* multiple charts dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("layout")}
            className="p-2 rounded hover:opacity-50 cursor-pointer flex items-center"
          >
            <LayoutGrid className="w-5 h-5 text-white" />
          </button>

          {openDropdown === "layout" && (
            <ul className="absolute top-full left-0 mt-2 bg-[#2c2c2c] text-white rounded shadow z-50 w-64 overflow-y-auto max-h-[50vh]">
              {/* Search input */}
              <li className="px-2 py-2">
                <input
                  type="text"
                  placeholder="ticker for another chart..."
                  value={searchLayouts}
                  onChange={(e) => setSearchLayouts(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#1c1c1c] text-white focus:outline-none"
                />
              </li>

              {/* Filtered list */}
              {searchLayouts !== "" &&
                allTickers
                  .filter((t) =>
                    t.ticker.toLowerCase().includes(searchLayouts.toLowerCase())
                  )
                  .map((t, i) => (
                    <li
                      key={`${t.ticker}-${i}`}
                      className="px-2 py-1 hover:opacity-50 cursor-pointer"
                      onClick={() => {
                        handleAddLayout(t.ticker);
                        setOpenDropdown(null);
                        setSearchLayouts(""); // reset search
                      }}
                    >
                      {t.ticker} ({t.exchange})
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
          className={`sm:absolute right-0 mr-1 rounded  text-black hover:opacity-50 cursor-pointer transition-transform ${
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
