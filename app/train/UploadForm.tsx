"use client";
import { useState } from "react";
import { parse } from "papaparse";

export default function UploadForm({
  onUpload,
}: {
  onUpload: (rows: any[]) => void;
}) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<any[]>([]);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const allRows: any[] = [];
    for (const file of Array.from(files)) {
      const text = await file.text();
      const parsed = parse(text, { header: true, skipEmptyLines: true });
      allRows.push(...parsed.data);
    }

    if (allRows.length > 0) {
      setHeaders(Object.keys(allRows[0]));
      setSampleRows(allRows.slice(0, 5));
      onUpload(allRows); // ✅ pass rows up to parent
    }
  }

  return (
    <div className="">
      {/* File input */}
      <input
        type="file"
        multiple
        accept=".csv"
        onChange={handleChange}
        className="block cursor-pointer w-full text-sm text-gray-300
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-lg file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-600 file:text-white
                   hover:file:opacity-50"
      />

      {/* Headers preview */}
      {headers.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Detected Headers</h3>
          <div className="bg-gray-800 rounded p-3 overflow-x-auto text-xs">
            <code>{headers.join(", ")}</code>
          </div>
        </div>
      )}

      {/* Sample rows preview */}
      {sampleRows.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Sample Rows</h3>
          <div className="bg-gray-800 rounded p-3 overflow-x-auto text-xs">
            <table className="table-auto border-collapse w-full min-w-max text-xs">
              <thead className="bg-gray-900 text-gray-300">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="border px-2 py-1 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleRows.map((row, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-gray-700" : "bg-gray-600"}
                  >
                    {headers.map((h) => (
                      <td key={h} className="border px-2 py-1">
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
