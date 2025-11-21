"use client";

import { useState } from "react";
import Papa from "papaparse";
import { convertMultipleFiles, RawBar, EnrichedBar } from "@/lib/convertBars";
import Header from "../components/Header";

export default function ConvertBarsPage() {
  const [enriched, setEnriched] = useState<EnrichedBar[] | null>(null);

  /**
   * Handle multiple file uploads and parse CSVs into RawBar[] arrays.
   * Once all files are parsed, pass them to convertMultipleFiles.
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const parsedFiles: RawBar[][] = [];
    let processedCount = 0;

    Array.from(files).forEach((file) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          const rows = results.data as RawBar[];

          // 🔹 Derive ticker from file name (strip extension)
          const ticker = file.name.split(".")[0].toUpperCase();

          // 🔹 Attach ticker to each row
          const withTicker = rows.map((row) => ({
            ...row,
            ticker,
          }));

          parsedFiles.push(withTicker);

          processedCount++;
          console.log(
            `[ConvertBarsPage] Parsed file: ${file.name}, rows=${rows.length}, ticker=${ticker}`
          );

          if (processedCount === files.length) {
            const processed = convertMultipleFiles(parsedFiles);
            setEnriched(processed);
          }
        },
      });
    });
  };

  /**
   * Handle download of combined dataset as CSV.
   * Includes both raw and normalized fields.
   */
  const handleDownload = () => {
    if (!enriched) return;

    const headers = [
      "ticker",
      "time",
      "open",
      "high",
      "low",
      "close",
      "volume",
      "ema",
      "rsi",
      "obv",
      "vwap",
      "bb_upper",
      "bb_middle",
      "bb_lower",
      "open_norm",
      "high_norm",
      "low_norm",
      "close_norm",
      "volume_norm",
      "ema_norm",
      "rsi_norm",
      "obv_norm",
      "vwap_norm",
      "bb_upper_norm",
      "bb_middle_norm",
      "bb_lower_norm",
    ];

    const rows = enriched.map((d) =>
      [
        d.ticker ?? "",
        d.time,
        d.open,
        d.high,
        d.low,
        d.close,
        d.volume,
        d.ema,
        d.rsi,
        d.obv,
        d.vwap,
        d.bb_upper,
        d.bb_middle,
        d.bb_lower,
        d.open_norm,
        d.high_norm,
        d.low_norm,
        d.close_norm,
        d.volume_norm,
        d.ema_norm,
        d.rsi_norm,
        d.obv_norm,
        d.vwap_norm,
        d.bb_upper_norm,
        d.bb_middle_norm,
        d.bb_lower_norm,
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "converted_bars.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#2c2c2c] text-white w-screen min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-col w-full h-full items-center justify-start p-6">
        <h1 className="font-semibold mb-8 text-xl">Convert Bars</h1>

        {/* Upload input */}
        <input
          type="file"
          accept=".csv"
          multiple
          onChange={handleFileUpload}
          className="border px-3 py-2 rounded-md text-gray-400 cursor-pointer hover:text-white hover:border-white mb-6"
        />

        {enriched && (
          <div className="flex flex-col w-full h-full items-center justify-start mt-6">
            {/* Download button */}
            <button
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mb-6 cursor-pointer"
            >
              Download Converted CSV
            </button>

            {/* Preview header */}
            <h2 className="text-lg font-semibold mb-4 w-full text-left">
              Preview (first 50 rows)
            </h2>

            {/* Scrollable table container */}
            <div className="overflow-x-auto overflow-y-auto max-h-[70vh] w-full border border-gray-700 rounded-md">
              <table className="table-auto border-collapse w-full text-xs">
                <thead className="bg-gray-800 text-gray-300 sticky top-0">
                  <tr>
                    <th className="border border-gray-700 px-2 py-1">Ticker</th>
                    <th className="border border-gray-700 px-2 py-1">Time</th>
                    <th className="border border-gray-700 px-2 py-1">Open</th>
                    <th className="border border-gray-700 px-2 py-1">
                      Open_norm
                    </th>
                    <th className="border border-gray-700 px-2 py-1">Close</th>
                    <th className="border border-gray-700 px-2 py-1">
                      Close_norm
                    </th>
                    <th className="border border-gray-700 px-2 py-1">Volume</th>
                    <th className="border border-gray-700 px-2 py-1">
                      Volume_norm
                    </th>
                    <th className="border border-gray-700 px-2 py-1">EMA</th>
                    <th className="border border-gray-700 px-2 py-1">
                      EMA_norm
                    </th>
                    <th className="border border-gray-700 px-2 py-1">RSI</th>
                    <th className="border border-gray-700 px-2 py-1">
                      RSI_norm
                    </th>
                    <th className="border border-gray-700 px-2 py-1">OBV</th>
                    <th className="border border-gray-700 px-2 py-1">
                      OBV_norm
                    </th>
                    <th className="border border-gray-700 px-2 py-1">VWAP</th>
                    <th className="border border-gray-700 px-2 py-1">
                      VWAP_norm
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {enriched.slice(0, 50).map((row, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}
                    >
                      <td className="border border-gray-700 px-2 py-1">
                        {row.ticker ?? "-"}
                      </td>
                      <td className="border border-gray-700 px-2 py-1 whitespace-nowrap">
                        {row.time}
                      </td>
                      <td className="border border-gray-700 px-2 py-1">
                        {row.open}
                      </td>
                      <td className="border border-gray-700 px-2 py-1">
                        {row.open_norm?.toFixed(3)}
                      </td>
                      <td className="border border-gray-700 px-2 py-1">
                        {row.close}
                      </td>
                      <td className="border border-gray-700 px-2 py-1">
                        {row.close_norm?.toFixed(3)}
                      </td>
                      <td className="border border-gray-700 px-2 py-1">
                        {row.volume}
                      </td>
                      <td className="border border-gray-700 px-2 py-1">
                        {row.volume_norm?.toFixed(3)}
                      </td>
                      <td className="border border-gray-700 px-2 py-1">
                        {row.ema ?? "-"}
                      </td>
                      <td className="border border-gray-700 px-2 py-1">
                        {row.ema_norm?.toFixed(3)}
                      </td>
                      <td className="border border-gray-700 px-2 py-1">
                        {row.rsi ?? "-"}
                      </td>
                      <td className="border border-gray-700 px-2 py-1">
                        {row.rsi_norm?.toFixed(3)}
                      </td>
                      <td className="border border-gray-700 px-2 py-1">
                        {row.obv ?? "-"}
                      </td>
                      <td className="border border-gray-700 px-2 py-1">
                        {row.obv_norm?.toFixed(3)}
                      </td>
                      <td className="border border-gray-700 px-2 py-1">
                        {row.vwap ?? "-"}
                      </td>
                      <td className="border border-gray-700 px-2 py-1">
                        {row.vwap_norm?.toFixed(3)}
                      </td>
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
