"use client";

import { useIndicatorStore } from "@/stores/useIndicatorStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { X } from "lucide-react";

export default function SelectedIndicators() {
  const {
    selectedIndicators,
    removeIndicator,
    selectedPatterns,
    removePattern,
  } = useIndicatorStore();

  const { comparedTickers, layoutTickers, removeCompare, removeLayout } =
    useSearchStore();

  const isready =
    selectedIndicators.length +
    selectedPatterns.length +
    comparedTickers.length +
    layoutTickers.length;

  if (!isready) return null;

  return (
    <div className="flex gap-3 flex-wrap px-3">
      <div className="flex gap-1 items-center">
        {selectedIndicators.map((name) => (
          <div
            key={name}
            className="flex items-center gap-1 p-1 bg-emerald-300 text-gray-600 rounded text-sm "
          >
            <span>{name}</span>
            <button
              className="cursor-pointer hover:text-[#ff5f5f]"
              onClick={() => removeIndicator(name)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-1 items-center">
        {selectedPatterns.map((pat) => (
          <div
            key={pat}
            className="flex items-center gap-1 p-1 bg-blue-400 text-white rounded text-sm "
          >
            <span>{pat}</span>
            <button
              className="cursor-pointer hover:text-[#ff5f5f]"
              onClick={() => removePattern(pat)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-1 items-center">
        {comparedTickers.map((name) => (
          <div
            key={name}
            className="flex items-center gap-1 p-1 bg-amber-600 text-white rounded text-sm "
          >
            <span>{name}</span>
            <button
              className="cursor-pointer hover:text-[#ff5f5f]"
              onClick={() => removeCompare(name)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-1 items-center">
        {layoutTickers.map((ticker) => (
          <div
            key={ticker.ticker}
            className="flex items-center gap-1 p-1 bg-indigo-500 text-white rounded text-sm "
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
