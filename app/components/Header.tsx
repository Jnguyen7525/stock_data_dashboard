import Link from "next/link";
import React, { useState } from "react";
import { EllipsisVertical } from "lucide-react";

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full p-3 justify-between items-center relative">
      <Link href={"/"} className="text-[#83ffe6] font-bold hover:opacity-50">
        SPIES
      </Link>

      <div className="flex items-center gap-4">
        {/* Ellipsis dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-md hover:opacity-50"
          >
            <EllipsisVertical className="w-5 h-5 text-white cursor-pointer" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-[#2c2c2c] border border-gray-700 rounded-md shadow-lg z-50">
              <Link
                href="/convertBars"
                className="block px-4 py-2 text-sm text-white hover:opacity-50"
                onClick={() => setOpen(false)}
              >
                Convert Bars
              </Link>
              <Link
                href="/buildEpisodes"
                className="block px-4 py-2 text-sm text-white hover:opacity-50"
                onClick={() => setOpen(false)}
              >
                Build Episodes
              </Link>

              <Link
                href="/train"
                className="block px-4 py-2 text-sm text-white hover:opacity-50"
              >
                Train Model
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
