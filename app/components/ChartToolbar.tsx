"use client";

import { Timeframe, useChartStore } from "@/stores/chartStore";
import { useIndicatorStore } from "@/stores/useIndicatorStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function ChartToolbar() {
  const { chartType, setChartType, setTicker, timeframe, setTimeframe } =
    useChartStore();
  const currentTicker = useChartStore((s) => s.ticker);

  const { filtered, filterTickers, setAllTickers } = useSearchStore();
  const { allIndicators, selectedIndicators, setAllIndicators, addIndicator } =
    useIndicatorStore();

  const [input, setInput] = useState(currentTicker);
  const [showDropdown, setShowDropdown] = useState(false);

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

  const handleSelect = (ticker: string) => {
    setInput(ticker);
    setTicker(ticker);
    setShowDropdown(false);
  };

  const handleAddIndicator = (name: string) => {
    if (name && !selectedIndicators.includes(name)) {
      addIndicator(name);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row w-full justify-between items-center gap-4 p-3 bg-[#2c2c2c] rounded text-white">
      {/* Ticker Search */}
      <div className="flex gap-2 items-center justify-center border-b border-gray-600 px-2 py-1 relative w-96">
        <input
          className="text-white outline-none bg-transparent w-full"
          placeholder="Search ticker..."
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onFocus={() => {
            if (input.length > 0 && input !== currentTicker) {
              setShowDropdown(true);
            }
          }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        />
        <Search />
        {showDropdown && filtered.length > 0 && (
          <ul className="absolute top-full left-0 right-0 bg-[#2c2c2c] text-white mt-1 rounded shadow z-10 max-h-60 overflow-y-auto">
            {filtered.map((t, i) => (
              <li
                key={`${t.ticker}-${t.exchange}-${i}`}
                className="px-3 py-1 hover:bg-gray-700 cursor-pointer"
                onMouseDown={() => handleSelect(t.ticker)}
              >
                {t.ticker} ({t.exchange})
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex items-center">
        {/* Indicator Dropdown */}
        <select
          className="outline-none cursor-pointer bg-[#2c2c2c] text-white px-2"
          onChange={(e) => handleAddIndicator(e.target.value)}
          defaultValue=""
        >
          <option value="">Add Indicator</option>
          {allIndicators.map((ind, i) => (
            <option key={`${ind.name}-${i}`} value={ind.name}>
              {ind.name}
            </option>
          ))}
        </select>
        {/* Timeframe Dropdown */}
        <select
          className="outline-none cursor-pointer bg-[#2c2c2c] text-white px-2"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as Timeframe)}
        >
          <option value="1Min">1m</option>
          <option value="5Min">5m</option>
          <option value="15Min">15m</option>
          <option value="30Min">30m</option>
          <option value="1H">1h</option>
          <option value="4H">4h</option>
          <option value="1D">1D</option>
        </select>
        {/* Chart Type Dropdown */}
        <select
          className="outline-none cursor-pointer bg-[#2c2c2c] text-white px-2"
          value={chartType}
          onChange={(e) =>
            setChartType(e.target.value as "line" | "candlestick")
          }
        >
          <option value="line">Line Chart</option>
          <option value="candlestick">Candlestick Chart</option>
        </select>
      </div>
    </div>
  );
}
