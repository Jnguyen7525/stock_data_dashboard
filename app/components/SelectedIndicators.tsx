"use client";

import { useIndicatorStore } from "@/stores/useIndicatorStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export default function SelectedIndicators({
  ticker,
  isMainChart,
}: {
  ticker: string;
  isMainChart: boolean;
}) {
  const {
    selectedIndicators,
    removeIndicator,
    selectedPatterns,
    removePattern,
  } = useIndicatorStore();

  const {
    comparedTickers,
    layoutTickers,
    removeCompare,
    removeLayout,
    removeLayoutIndicator,
    removeLayoutPattern,
    removeLayoutCompare,
  } = useSearchStore();

  const currentState = useSearchStore((state) =>
    state.layoutTickers.find((l) => l.ticker === ticker)
  );

  const popIndicator = (indicator: string) => {
    if (isMainChart) {
      removeIndicator(indicator); // main chart store
    } else {
      removeLayoutIndicator(ticker, indicator); // layout ticker store
    }
  };

  const popPattern = (pattern: string) => {
    if (isMainChart) {
      removePattern(pattern); // main chart store
    } else {
      removeLayoutPattern(ticker, pattern); // layout ticker store
    }
  };

  const popCompare = (compareTicker: string) => {
    if (isMainChart) {
      removeCompare(compareTicker); // main chart store
    } else {
      removeLayoutCompare(ticker, compareTicker); // layout ticker store
    }
  };

  const [currentIndicators, setCurrentIndicators] = useState<string[]>([]);
  const [currentPatterns, setCurrentPatterns] = useState<string[]>([]);
  const [currentCompared, setCurrentCompared] = useState<string[]>([]);

  useEffect(() => {
    if (isMainChart) {
      console.log("indicator in main:", selectedIndicators, currentIndicators);
      setCurrentIndicators(selectedIndicators); // string[]
    } else {
      console.log(
        "indicator in layout:",
        currentState?.selectedIndicators,
        currentIndicators,
        ticker
      );

      setCurrentIndicators(currentState?.selectedIndicators ?? []);
    }
  }, [isMainChart, selectedIndicators, layoutTickers]);

  useEffect(() => {
    if (isMainChart) {
      console.log("indicator in main:", selectedIndicators, currentIndicators);
      setCurrentPatterns(selectedPatterns); // string[]
    } else {
      console.log(
        "indicator in layout:",
        currentState?.selectedPatterns,
        currentIndicators,
        ticker
      );

      setCurrentPatterns(currentState?.selectedPatterns ?? []);
    }
  }, [isMainChart, selectedPatterns, layoutTickers]);

  useEffect(() => {
    if (isMainChart) {
      console.log("indicator in main:", comparedTickers, currentIndicators);
      setCurrentCompared(comparedTickers); // string[]
    } else {
      console.log(
        "indicator in layout:",
        currentState?.compareTickers,
        currentIndicators,
        ticker
      );

      setCurrentCompared(currentState?.compareTickers ?? []);
    }
  }, [isMainChart, comparedTickers, layoutTickers]);

  const isready =
    currentIndicators.length +
    currentPatterns.length +
    comparedTickers.length +
    layoutTickers.length;

  if (!isready) return null;

  return (
    <div className="flex gap-3 overflow-x-auto py-1">
      <div className="flex gap-1 items-center">
        {currentIndicators.map((name) => (
          <div
            key={name}
            className="flex shrink-0 items-center gap-1 px-1 bg-emerald-300 text-gray-600 rounded text-sm "
          >
            <span>{name}</span>
            <button
              className="cursor-pointer hover:text-[#ff5f5f]"
              onClick={() => popIndicator(name)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {currentPatterns.map((pat) => (
          <div
            key={pat}
            className="flex shrink-0  items-center gap-1 px-1 bg-blue-400 text-white rounded text-sm "
          >
            <span>{pat}</span>
            <button
              className="cursor-pointer hover:text-[#ff5f5f]"
              onClick={() => popPattern(pat)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {currentCompared.map((name) => (
          <div
            key={name}
            className="flex shrink-0  items-center gap-1 px-1 bg-amber-600 text-white rounded text-sm "
          >
            <span>{name}</span>
            <button
              className="cursor-pointer hover:text-[#ff5f5f]"
              onClick={() => popCompare(name)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {isMainChart &&
          layoutTickers.map((ticker) => (
            <div
              key={ticker.ticker}
              className="flex shrink-0 items-center gap-1 px-1 bg-indigo-500 text-white rounded text-sm "
            >
              <span>{ticker.ticker}</span>
              <button
                className="cursor-pointer hover:text-[#ff5f5f]"
                onClick={() => removeLayout(ticker.ticker)}
              >
                <X size={14} />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
