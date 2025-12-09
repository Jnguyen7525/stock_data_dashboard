import { create } from "zustand";

interface TickerInfo {
  ticker: string;
  exchange: string;
  assetType: string;
}

interface LayoutTickers {
  ticker: string;
  dir: string;
}

interface SearchState {
  allTickers: TickerInfo[];
  filteredTickers: TickerInfo[];

  comparedTickers: string[];
  layoutTickers: LayoutTickers[];

  setAllTickers: (list: TickerInfo[]) => void;
  filterTickers: (query: string) => void;

  addCompare: (ticker: string) => void;
  removeCompare: (ticker: string) => void;

  addLayout: (ticker: string, dir: string) => void;
  removeLayout: (ticker: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  allTickers: [],
  filteredTickers: [],

  comparedTickers: [],
  layoutTickers: [],

  setAllTickers: (list) => set({ allTickers: list }),
  filterTickers: (query) =>
    set((state) => ({
      filteredTickers: state.allTickers.filter((t) =>
        t.ticker.toLowerCase().includes(query.toLowerCase())
      ),
    })),

  addCompare: (ticker) =>
    set((state) => ({
      comparedTickers: [...new Set([...state.comparedTickers, ticker])],
    })),
  removeCompare: (ticker) =>
    set((state) => ({
      comparedTickers: state.comparedTickers.filter((i) => i !== ticker),
    })),

  addLayout: (ticker: string, dir: string) =>
    set((state) => ({
      layoutTickers: [
        ...state.layoutTickers.filter((l) => l.ticker !== ticker),
        { ticker, dir },
      ],
    })),
  removeLayout: (ticker) =>
    set((state) => ({
      layoutTickers: state.layoutTickers.filter((l) => l.ticker !== ticker),
    })),
}));
