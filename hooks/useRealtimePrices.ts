import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useChartStore } from "@/stores/chartStore";

export function useRealtimePrices() {
  const updateChartSeries = useChartStore((s) => s.updateChartSeries);

  useEffect(() => {
    const channel = supabase
      .channel("prices")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "prices" },
        (payload) => {
          const { ticker, time, price } = payload.new;
          updateChartSeries(ticker, { time, value: price });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
