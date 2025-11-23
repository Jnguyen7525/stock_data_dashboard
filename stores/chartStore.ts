import { create } from "zustand";

type ChartType = "line" | "candlestick";

interface ChartPoint {
  time: string; // 'YYYY-MM-DD'
  value: number;
}

export type Timeframe = "1Min" | "5Min" | "15Min" | "30Min" | "1H" | "1D";

interface ChartState {
  chartType: ChartType;
  ticker: string;
  timeframe: Timeframe;
  data: Record<string, ChartPoint[]>;
  setChartType: (type: ChartType) => void;
  setTicker: (ticker: string) => void;
  setTimeframe: (tf: Timeframe) => void;
  updateChartSeries: (ticker: string, point: ChartPoint) => void;
  setChartSeries: (ticker: string, points: ChartPoint[]) => void;
  resetChartData: (ticker: string) => void;
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
  updateChartSeries: (ticker, point) =>
    set((state) => {
      const existing = state.data[ticker] || [];
      const updated = [...existing, point].slice(-30);
      return {
        data: {
          ...state.data,
          [ticker]: updated,
        },
      };
    }),
  setChartSeries: (ticker, points) =>
    set((state) => ({
      data: {
        ...state.data,
        [ticker]: points.slice(-30),
      },
    })),
  resetChartData: (ticker) =>
    set((state) => ({
      data: {
        ...state.data,
        [ticker]: [],
      },
    })),
  sidebarOpen: false,
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  showTrends: false,
  setShowTrends: () => set((state) => ({ showTrends: !state.showTrends })),
}));
