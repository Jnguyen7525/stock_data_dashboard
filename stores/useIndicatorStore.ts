import { create } from "zustand";

type Indicator = {
  name: string;
  type: string;
};

interface IndicatorStore {
  allIndicators: Indicator[];
  selectedIndicators: string[];
  setAllIndicators: (list: Indicator[]) => void;
  addIndicator: (name: string) => void;
  removeIndicator: (name: string) => void;
}

export const useIndicatorStore = create<IndicatorStore>((set) => ({
  allIndicators: [],
  selectedIndicators: [],
  setAllIndicators: (list) => set({ allIndicators: list }),
  addIndicator: (name) =>
    set((state) => ({
      selectedIndicators: [...new Set([...state.selectedIndicators, name])],
    })),
  removeIndicator: (name) =>
    set((state) => ({
      selectedIndicators: state.selectedIndicators.filter((i) => i !== name),
    })),
}));
