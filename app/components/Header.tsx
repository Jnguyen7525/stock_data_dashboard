import Link from "next/link";
import { useEffect, useState } from "react";
import { EllipsisVertical, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChartStore } from "@/stores/chartStore";
import { useSearchStore } from "@/stores/useSearchStore";

function Header() {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const { setTicker } = useChartStore();
  const currentTicker = useChartStore((s) => s.ticker);

  const { filtered, filterTickers, setAllTickers } = useSearchStore();

  const [input, setInput] = useState(currentTicker);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load tickers.json
  useEffect(() => {
    const loadTickers = async () => {
      const res = await fetch("/tickers.json");
      const data = await res.json();
      setAllTickers(data);
    };
    loadTickers();
  }, [setAllTickers]);

  // Debounce input
  useEffect(() => {
    const timeout = setTimeout(() => {
      const isTyping = input.length > 0 && input !== currentTicker;
      if (isTyping) {
        filterTickers(input);
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [input, currentTicker, filterTickers]);

  const handleSelect = (ticker: string) => {
    setInput(ticker);
    setTicker(ticker); // update global chart store
    setShowDropdown(false);
    router.push("/dashboard"); // redirect to chart dashboard
  };

  return (
    <div className="flex w-full p-3 justify-between items-center relative">
      <Link
        href={"/"}
        className="flex items-center sm:gap-2 font-extrabold sm:tracking-[0.25em] hover:opacity-80"
      >
        {/* Logo Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 text-[#83ffe6]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 17l6-6 4 4 8-8"
          />
        </svg>

        {/* Logo Text */}
        <span className="text-[#9B7DFF] sm:text-xl sm:font-extrabold drop-shadow-md uppercase">
          MARKET TALK
        </span>
      </Link>

      <div className="flex w-fit sm:w-1/3 justify-end sm:gap-5">
        <div className="flex  justify-between border-b border-[#83ffe6] text-white px-3 py-1">
          <input
            className="text-white outline-none "
            placeholder="Search ticker..."
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onFocus={() => {
              if (input.length > 0 && input !== currentTicker) {
                setShowDropdown(true);
              }
            }}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          />
          <Search
            className="text-[#83ffe6] cursor-pointer hover:opacity-50"
            onMouseDown={() => handleSelect(input)}
          />
          {showDropdown && filtered.length > 0 && (
            <ul className="absolute top-full left-0 right-0 bg-[#2c2c2c] text-white mt-1 rounded shadow z-10 max-h-60 overflow-y-auto border border-gray-700 p-5">
              {filtered.map((t, i) => (
                <li
                  key={`${t.ticker}-${t.exchange}-${i}`}
                  className="px-3 py-1 hover:bg-gray-700 cursor-pointer"
                  onMouseDown={() => handleSelect(t.ticker)}
                >
                  {t.ticker} ({t.exchange})
                </li>
              ))}
            </ul>
          )}
        </div>

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
                  className="block px-4 py-2 text-white hover:opacity-50"
                  onClick={() => setOpen(false)}
                >
                  Convert Bars
                </Link>
                <Link
                  href="/buildEpisodes"
                  className="block px-4 py-2 text-white hover:opacity-50"
                  onClick={() => setOpen(false)}
                >
                  Build Episodes
                </Link>

                <Link
                  href="/train"
                  className="block px-4 py-2 text-white hover:opacity-50"
                >
                  Train Model
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
