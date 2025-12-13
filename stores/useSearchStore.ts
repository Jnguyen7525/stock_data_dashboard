import { create } from "zustand";

type ChartType = "line" | "candlestick";
export type Timeframe = "1Min" | "5Min" | "15Min" | "30Min" | "1H" | "1D";

type Indicator = {
  name: string;
  type: string;
};

interface TickerInfo {
  ticker: string;
  exchange: string;
  assetType: string;
}

interface LayoutTicker {
  ticker: string;
  dir: string;
  chartType: ChartType;
  timeframe: Timeframe;
  candleStickData: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  showTrends: boolean;
  allIndicators: string[];
  selectedIndicators: string[];
  allPatterns: Indicator[];
  selectedPatterns: string[];
  compareTickers: string[]; // 🆕 per‑layout compare list
}

interface SearchState {
  allTickers: TickerInfo[];
  filteredTickers: TickerInfo[];

  comparedTickers: string[]; // global compare list
  layoutTickers: LayoutTicker[];

  setAllTickers: (list: TickerInfo[]) => void;
  filterTickers: (query: string) => void;

  addCompare: (ticker: string) => void;
  removeCompare: (ticker: string) => void;

  addLayout: (ticker: string, dir: string) => void;
  removeLayout: (ticker: string) => void;

  // 🔧 Update helpers for layout tickers
  setLayoutCandleData: (
    ticker: string,
    data: LayoutTicker["candleStickData"]
  ) => void;
  toggleLayoutTrends: (ticker: string) => void;
  setLayoutTimeframe: (ticker: string, tf: Timeframe) => void;
  addLayoutIndicator: (ticker: string, name: string) => void;
  removeLayoutIndicator: (ticker: string, name: string) => void;
  addLayoutPattern: (ticker: string, name: string) => void;
  removeLayoutPattern: (ticker: string, name: string) => void;

  // 🆕 per‑layout compare helpers
  addLayoutCompare: (ticker: string, compare: string) => void;
  removeLayoutCompare: (ticker: string, compare: string) => void;
  setLayoutChartType: (ticker: string, type: ChartType) => void;
  setLayoutTicker: (oldTicker: string, newTicker: string) => void;
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

  // 🆕 Add layout ticker with full state initialized
  addLayout: (ticker: string, dir: string) =>
    set((state) => ({
      layoutTickers: [
        ...state.layoutTickers.filter((l) => l.ticker !== ticker),
        {
          ticker,
          dir,
          chartType: "candlestick",
          timeframe: "1D",
          candleStickData: [],
          showTrends: false,
          allIndicators: [],
          selectedIndicators: [],
          allPatterns: [],
          selectedPatterns: [],
          compareTickers: [], // initialize empty
        },
      ],
    })),

  removeLayout: (ticker) =>
    set((state) => ({
      layoutTickers: state.layoutTickers.filter((l) => l.ticker !== ticker),
    })),

  // 🔧 Update helpers
  setLayoutCandleData: (ticker, data) =>
    set((state) => ({
      layoutTickers: state.layoutTickers.map((l) =>
        l.ticker === ticker ? { ...l, candleStickData: data } : l
      ),
    })),

  toggleLayoutTrends: (ticker) =>
    set((state) => ({
      layoutTickers: state.layoutTickers.map((l) =>
        l.ticker === ticker ? { ...l, showTrends: !l.showTrends } : l
      ),
    })),

  setLayoutTimeframe: (ticker, tf) =>
    set((state) => ({
      layoutTickers: state.layoutTickers.map((l) =>
        l.ticker === ticker ? { ...l, timeframe: tf } : l
      ),
    })),

  addLayoutIndicator: (ticker, name) =>
    set((state) => ({
      layoutTickers: state.layoutTickers.map((l) =>
        l.ticker === ticker
          ? {
              ...l,
              selectedIndicators: [...new Set([...l.selectedIndicators, name])],
            }
          : l
      ),
    })),

  removeLayoutIndicator: (ticker, name) =>
    set((state) => ({
      layoutTickers: state.layoutTickers.map((l) =>
        l.ticker === ticker
          ? {
              ...l,
              selectedIndicators: l.selectedIndicators.filter(
                (i) => i !== name
              ),
            }
          : l
      ),
    })),

  addLayoutPattern: (ticker, name) =>
    set((state) => ({
      layoutTickers: state.layoutTickers.map((l) =>
        l.ticker === ticker
          ? {
              ...l,
              selectedPatterns: [...new Set([...l.selectedPatterns, name])],
            }
          : l
      ),
    })),

  removeLayoutPattern: (ticker, name) =>
    set((state) => ({
      layoutTickers: state.layoutTickers.map((l) =>
        l.ticker === ticker
          ? {
              ...l,
              selectedPatterns: l.selectedPatterns.filter((i) => i !== name),
            }
          : l
      ),
    })),

  // 🆕 per‑layout compare helpers
  addLayoutCompare: (ticker, compare) =>
    set((state) => ({
      layoutTickers: state.layoutTickers.map((l) =>
        l.ticker === ticker
          ? {
              ...l,
              compareTickers: [...new Set([...l.compareTickers, compare])],
            }
          : l
      ),
    })),

  removeLayoutCompare: (ticker, compare) =>
    set((state) => ({
      layoutTickers: state.layoutTickers.map((l) =>
        l.ticker === ticker
          ? {
              ...l,
              compareTickers: l.compareTickers.filter((c) => c !== compare),
            }
          : l
      ),
    })),

  setLayoutChartType: (ticker, type) =>
    set((state) => ({
      layoutTickers: state.layoutTickers.map((l) =>
        l.ticker === ticker ? { ...l, chartType: type } : l
      ),
    })),

  setLayoutTicker: (oldTicker, newTicker) =>
    set((state) => ({
      layoutTickers: state.layoutTickers.map((l) =>
        l.ticker === oldTicker ? { ...l, ticker: newTicker } : l
      ),
    })),
}));
