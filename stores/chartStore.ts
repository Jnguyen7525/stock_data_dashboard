import { create } from "zustand";

type ChartType = "line" | "candlestick";

export type Timeframe = "1Min" | "5Min" | "15Min" | "30Min" | "1H" | "1D";

interface ChartState {
  chartType: ChartType;
  ticker: string;
  timeframe: Timeframe;

  setChartType: (type: ChartType) => void;
  setTicker: (ticker: string) => void;
  setTimeframe: (tf: Timeframe) => void;

  candleStickData: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  setCandleStickData: (
    data: Array<{
      time: number;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>
  ) => void;
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  showTrends: boolean;
  setShowTrends: () => void;
}

export const useChartStore = create<ChartState>((set) => ({
  chartType: "candlestick",
  ticker: "",
  timeframe: "1D",
  data: {},
  setChartType: (type) => set({ chartType: type }),
  setTicker: (ticker) => set({ ticker }),
  setTimeframe: (tf) => set({ timeframe: tf }),

  candleStickData: [],
  setCandleStickData: (data) => set({ candleStickData: data }),
  sidebarOpen: false,
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  showTrends: false,
  setShowTrends: () => set((state) => ({ showTrends: !state.showTrends })),
}));
