import { create } from "zustand";

interface TickerInfo {
  ticker: string;
  exchange: string;
  assetType: string;
}

interface SearchState {
  allTickers: TickerInfo[];
  filtered: TickerInfo[];
  setAllTickers: (list: TickerInfo[]) => void;
  filterTickers: (query: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  allTickers: [],
  filtered: [],
  setAllTickers: (list) => set({ allTickers: list }),

  filterTickers: (query) =>
    set((state) => {
      const matches = state.allTickers
        .filter((t) => t.ticker.startsWith(query.toUpperCase()))
        .slice(0, 10);
      console.log("Filtered matches:", matches);
      return { filtered: matches };
    }),
}));
