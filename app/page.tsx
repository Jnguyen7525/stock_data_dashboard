"use client";

import { useEffect, useState } from "react";
import Header from "./components/Header";
import { useSearchStore } from "@/stores/useSearchStore";

interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  author: string;
  source: string;
  created_at: string;
  url: string;
  images?: { size: string; url: string }[];
  symbols?: string[];
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const setAllTickers = useSearchStore((s) => s.setAllTickers);

  useEffect(() => {
    const loadTickers = async () => {
      const res = await fetch("/tickers.json");
      const data = await res.json();
      console.log("Loaded tickers:", data.length); // ✅ should show a number
      setAllTickers(data);
    };

    loadTickers();
  }, []);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const res = await fetch("/api/alpaca/news?limit=20");
        const data = await res.json();
        setNews(data);
      } catch (err) {
        console.error("Failed to load news:", err);
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  const mainStory = news[0];
  const otherStories = news.slice(1);

  return (
    <main className="bg-[#2c2c2c] text-white min-h-screen flex flex-col">
      <Header />

      <section className="max-w-6xl mx-auto px-6 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-6">Latest Market News</h1>

        {loading && <p>Loading news...</p>}

        {/* Hero section for main story */}
        {mainStory && (
          <article className="mb-10 bg-[#1f1f1f] rounded-lg overflow-hidden shadow-lg">
            {mainStory.images && mainStory.images.length > 0 && (
              <img
                src={mainStory.images.find((img) => img.size === "large")?.url}
                alt={mainStory.headline}
                className="w-full h-96 object-cover"
              />
            )}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-3">
                <a
                  href={mainStory.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {mainStory.headline}
                </a>
              </h2>
              <p className="text-gray-300 mb-4">{mainStory.summary}</p>
              <div className="text-sm text-gray-400">
                <span>{mainStory.source}</span> •{" "}
                <span>{new Date(mainStory.created_at).toLocaleString()}</span>
                {mainStory.author && (
                  <>
                    {" "}
                    • <span>{mainStory.author}</span>
                  </>
                )}
              </div>
            </div>
          </article>
        )}

        {/* Grid for other stories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {otherStories.map((item) => (
            <article
              key={item.id}
              className="bg-[#1f1f1f] shadow-md rounded-lg overflow-hidden flex flex-col"
            >
              {item.images && item.images.length > 0 && (
                <img
                  src={item.images.find((img) => img.size === "small")?.url}
                  alt={item.headline}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-lg font-semibold mb-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {item.headline}
                  </a>
                </h2>
                <p className="text-sm text-gray-400 mb-3 line-clamp-3">
                  {item.summary}
                </p>
                <div className="mt-auto text-xs text-gray-500">
                  <span>{item.source}</span> •{" "}
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                  {item.author && (
                    <>
                      {" "}
                      • <span>{item.author}</span>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Footer() {
  return (
    <footer className="bg-[#1f1f1f] text-gray-400 py-6 mt-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        {/* Left side: identity */}
        <div className="mb-4 md:mb-0">
          <h2 className="text-white font-semibold text-lg">Market Talk</h2>
          <p className="text-sm">Charts & News Showcase App</p>
        </div>

        {/* Center: nav links */}
        <nav className="flex space-x-6 text-sm">
          <a href="/dashboard" className="hover:text-white">
            Dashboard
          </a>
          <a href="/news" className="hover:text-white">
            News
          </a>
          <a href="/" className="hover:text-white">
            About
          </a>
        </nav>

        {/* Right side: disclaimer/credits */}
        <div className="text-xs text-gray-500 mt-4 md:mt-0 text-center md:text-right">
          <p>Powered by Alpaca News API • Built with Next.js & TailwindCSS</p>
          <p>Demo app — not financial advice</p>
        </div>
      </div>
    </footer>
  );
}
