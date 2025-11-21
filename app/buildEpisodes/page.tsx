"use client";
import { useState } from "react";
import Papa from "papaparse";
import { buildEpisodes, Episode, RawRow } from "@/lib/episodeBuilder";
import Header from "../components/Header";

export default function BuildEpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [ticker, setTicker] = useState<string>("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      console.warn("[handleFileUpload] No files provided");
      return;
    }

    console.log(
      `[handleFileUpload] ${files.length} file(s) selected for ticker ${ticker}`
    );

    Array.from(files).forEach((file) => {
      console.log(`[handleFileUpload] Parsing file: ${file.name}`);
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        transformHeader: (h) => h.trim().toLowerCase(),
        complete: (results) => {
          console.log(`[Papa.parse] Completed parsing ${file.name}`);
          console.log(`[Papa.parse] Raw rows count: ${results.data.length}`);

          const rows = (results.data as any[]).map((r, idx) => {
            let timeVal = r.time ?? r.start ?? null;
            if (typeof timeVal === "number") {
              timeVal = new Date(timeVal * 1000).toISOString();
            }
            return { ...r, time: timeVal } as RawRow;
          });

          console.log(`[Papa.parse] Normalized rows count: ${rows.length}`);
          console.log("[Papa.parse] First row sample:", rows[0]);

          const eps = buildEpisodes(rows, 0.1);
          console.log(`[buildEpisodes] Returned ${eps.length} episodes`);
          if (eps.length > 0) {
            console.log("[buildEpisodes] First episode sample:", eps[0]);
          }

          setEpisodes((prev) => {
            const updated = [...prev, ...eps];
            console.log(
              `[setEpisodes] Total episodes in state: ${updated.length}`
            );
            return updated;
          });
        },
      });
    });
  };

  const handleDownload = () => {
    if (episodes.length === 0) {
      console.warn("[handleDownload] No episodes to download");
      return;
    }
    console.log(
      `[handleDownload] Preparing CSV for ${episodes.length} episodes`
    );

    const headers = [
      "ticker",
      "episode_id",
      "start_time",
      "end_time",
      "duration",
      "direction",
      "total_return",
      "lr_slope_5",
      "lr_slope_5_norm",
      "lr_fit_r2_5",
      "trend_quality",
      "avg_volume",
      "avg_volume_norm",
      "max_volume",
      "avg_rsi",
      "avg_rsi_norm",
      "avg_volatility",
      "avg_volatility_norm",
      "obv_change",
      "obv_change_norm",
      "avg_vwap",
      "avg_vwap_norm",
      "price_start",
      "price_end",
      "price_delta",
      "price_start_norm",
      "price_end_norm",
      "rsi_start",
      "rsi_end",
      "rsi_start_norm",
      "rsi_end_norm",
      "vwap_start",
      "vwap_end",
      "vwap_start_norm",
      "vwap_end_norm",
      "obv_start",
      "obv_end",
      "obv_start_norm",
      "obv_end_norm",
      "ema_start",
      "ema_end",
      "ema_start_norm",
      "ema_end_norm",
    ];

    const rows = episodes.map((ep) =>
      [
        ep.ticker,
        ep.episode_id,
        ep.start_time,
        ep.end_time,
        ep.duration,
        ep.direction,
        ep.total_return,
        ep.lr_slope_5,
        ep.lr_slope_5_norm,
        ep.lr_fit_r2_5,
        (ep as any).trend_quality,
        ep.avg_volume,
        ep.avg_volume_norm,
        ep.max_volume,
        ep.avg_rsi,
        ep.avg_rsi_norm,
        ep.avg_volatility,
        ep.avg_volatility_norm,
        ep.obv_change,
        ep.obv_change_norm,
        ep.avg_vwap,
        ep.avg_vwap_norm,
        ep.price_start,
        ep.price_end,
        ep.price_delta,
        ep.price_start_norm,
        ep.price_end_norm,
        ep.rsi_start,
        ep.rsi_end,
        ep.rsi_start_norm,
        ep.rsi_end_norm,
        ep.vwap_start,
        ep.vwap_end,
        ep.vwap_start_norm,
        ep.vwap_end_norm,
        ep.obv_start,
        ep.obv_end,
        ep.obv_start_norm,
        ep.obv_end_norm,
        ep.ema_start,
        ep.ema_end,
        ep.ema_start_norm,
        ep.ema_end_norm,
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "episodes.csv";
    a.click();
    URL.revokeObjectURL(url);

    console.log("[handleDownload] CSV download triggered");
  };

  return (
    <div className="bg-[#2c2c2c] text-white w-screen min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-col w-full h-full items-center justify-start p-6">
        <h1 className="font-semibold mb-8 text-xl">Build Episodes</h1>

        {/* <input
          type="text"
          placeholder="Enter ticker (e.g. AAPL)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          className="border px-3 py-2 rounded-md text-gray-400 mb-4 w-64 text-center"
        /> */}

        <input
          type="file"
          accept=".csv"
          multiple
          onChange={handleFileUpload}
          className="border px-3 py-2 rounded-md text-gray-400 cursor-pointer hover:text-white hover:border-white mb-6"
        />

        {episodes.length > 0 && (
          <div className="flex flex-col w-full h-full items-center justify-start mt-6">
            <button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md mb-6 cursor-pointer"
            >
              Download Episodes CSV
            </button>

            <h2 className="text-lg font-semibold mb-4 w-full text-left">
              Preview (first 50 episodes)
            </h2>

            <div className="overflow-x-auto overflow-y-auto max-h-[70vh] w-full border border-gray-700 rounded-md">
              <table className="table-auto border-collapse w-full text-xs">
                <thead className="bg-gray-800 text-gray-300 sticky top-0">
                  <tr>
                    <th className="border px-2 py-1">Ticker</th>
                    <th className="border px-2 py-1">Episode ID</th>
                    <th className="border px-2 py-1">Start</th>
                    <th className="border px-2 py-1">End</th>
                    <th className="border px-2 py-1">Duration</th>
                    <th className="border px-2 py-1">Return %</th>
                    <th className="border px-2 py-1">Slope</th>
                    <th className="border px-2 py-1">R²</th>
                    <th className="border px-2 py-1">Trend Quality</th>
                    <th className="border px-2 py-1">RSI Start</th>
                    <th className="border px-2 py-1">RSI End</th>
                    <th className="border px-2 py-1">RSI Start Norm</th>
                    <th className="border px-2 py-1">RSI End Norm</th>
                    <th className="border px-2 py-1">VWAP Start</th>
                    <th className="border px-2 py-1">VWAP End</th>
                    <th className="border px-2 py-1">VWAP Start Norm</th>
                    <th className="border px-2 py-1">VWAP End Norm</th>
                    <th className="border px-2 py-1">Direction</th>
                  </tr>
                </thead>
                <tbody>
                  {episodes.slice(0, 50).map((ep, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{ep.ticker}</td>
                      <td className="border px-2 py-1">{ep.episode_id}</td>
                      <td className="border px-2 py-1">{ep.start_time}</td>
                      <td className="border px-2 py-1">{ep.end_time}</td>
                      <td className="border px-2 py-1">{ep.duration}</td>
                      <td className="border px-2 py-1">
                        {(ep.total_return * 100).toFixed(2)}%
                      </td>
                      <td className="border px-2 py-1">
                        {ep.lr_slope_5.toFixed(4)}
                      </td>
                      <td className="border px-2 py-1">
                        {ep.lr_fit_r2_5.toFixed(3)}
                      </td>
                      <td className="border px-2 py-1">
                        {(ep as any).trend_quality}
                      </td>
                      <td className="border px-2 py-1">{ep.rsi_start}</td>
                      <td className="border px-2 py-1">{ep.rsi_end}</td>
                      <td className="border px-2 py-1">{ep.rsi_start_norm}</td>
                      <td className="border px-2 py-1">{ep.rsi_end_norm}</td>
                      <td className="border px-2 py-1">{ep.vwap_start}</td>
                      <td className="border px-2 py-1">{ep.vwap_end}</td>
                      <td className="border px-2 py-1">{ep.vwap_start_norm}</td>
                      <td className="border px-2 py-1">{ep.vwap_end_norm}</td>
                      <td className="border px-2 py-1">{ep.direction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
