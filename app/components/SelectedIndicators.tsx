"use client";

import { useIndicatorStore } from "@/stores/useIndicatorStore";
import { X } from "lucide-react";

export default function SelectedIndicators() {
  const { selectedIndicators, removeIndicator } = useIndicatorStore();

  if (selectedIndicators.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap p-3">
      {selectedIndicators.map((name) => (
        <div
          key={name}
          className="flex items-center gap-1 px-2 py-1 bg-gray-700 text-white rounded text-sm "
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
  );
}
