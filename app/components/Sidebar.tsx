"use client";

import { useState, useEffect } from "react";
import { useChartStore } from "@/stores/chartStore";

interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  author: string;
  url: string;
}

export default function Sidebar() {
  const { ticker, sidebarOpen, closeSidebar } = useChartStore();
  const [activeTab, setActiveTab] = useState<"info" | "news">("news");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch news when ticker changes
  useEffect(() => {
    if (!ticker) return;
    const loadNews = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/alpaca/news?ticker=${ticker}&limit=10`);
        const data = await res.json();
        setNews(data);
      } catch (err) {
        console.error("Failed to load news:", err);
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, [ticker]);

  return (
    <div
      className={`z-50 rounded-lg
        ${
          sidebarOpen
            ? " h-full bg-[#1f1f1f] border border-gray-700 text-white shadow-lg transform transition-transform duration-300 sm:translate-x-0 w-full"
            : "hidden "
        }
        `}
    >
      {/* Close button for mobile */}
      <div className="sm:hidden flex justify-end p-2 ">
        <button
          onClick={closeSidebar}
          className="text-[#ff5f5f] cursor-pointer hover:opacity-50"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex-1 py-2 text-center cursor-pointer hover:opacity-50 ${
            activeTab === "info" ? "bg-[#2c2c2c]" : ""
          }`}
        >
          Info
        </button>
        <button
          onClick={() => setActiveTab("news")}
          className={`flex-1 py-2 text-center cursor-pointer hover:opacity-50 ${
            activeTab === "news" ? "bg-[#2c2c2c]" : ""
          }`}
        >
          News
        </button>
      </div>

      {/* Tab content */}
      <div className="p-4 overflow-y-auto h-[calc(100%-3rem)]">
        {activeTab === "info" && (
          <div>
            <p className="text-gray-400">Info tab content goes here...</p>
          </div>
        )}

        {activeTab === "news" && (
          <div>
            {loading && <p>Loading news...</p>}
            {!loading && news.length === 0 && (
              <p className="text-gray-400">No news found for {ticker}</p>
            )}
            <ul className="space-y-4">
              {news.map((item) => (
                <li key={item.id} className="border-b border-gray-700 pb-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:underline"
                  >
                    {item.headline}
                  </a>
                  <p className="text-sm text-gray-300 mt-1">{item.summary}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.author || "Unknown author"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
