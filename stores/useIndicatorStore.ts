import { create } from "zustand";

type Indicator = {
  name: string;
  type: string;
};

interface IndicatorStore {
  allIndicators: Indicator[];
  selectedIndicators: string[];
  allPatterns: Indicator[];
  selectedPatterns: string[];

  setAllIndicators: (list: Indicator[]) => void;
  addIndicator: (name: string) => void;
  removeIndicator: (name: string) => void;
  setAllPatterns: (list: Indicator[]) => void;
  addPattern: (name: string) => void;
  removePattern: (name: string) => void;
}

export const useIndicatorStore = create<IndicatorStore>((set) => ({
  allIndicators: [],
  selectedIndicators: [],
  allPatterns: [],
  selectedPatterns: [],
  setAllIndicators: (list) => set({ allIndicators: list }),
  addIndicator: (name) =>
    set((state) => ({
      selectedIndicators: [...new Set([...state.selectedIndicators, name])],
    })),
  removeIndicator: (name) =>
    set((state) => ({
      selectedIndicators: state.selectedIndicators.filter((i) => i !== name),
    })),
  setAllPatterns: (list) => set({ allPatterns: list }),
  addPattern: (name) =>
    set((state) => ({
      selectedPatterns: [...new Set([...state.selectedPatterns, name])],
    })),
  removePattern: (name) =>
    set((state) => ({
      selectedPatterns: state.selectedPatterns.filter((i) => i !== name),
    })),
}));
