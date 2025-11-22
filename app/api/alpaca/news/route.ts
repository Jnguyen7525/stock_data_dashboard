import { NextRequest, NextResponse } from "next/server";

const isDev = process.env.NODE_ENV !== "production";
const ALPACA_API_KEY = process.env.ALPACA_API_KEY!;
const ALPACA_SECRET_KEY = process.env.ALPACA_API_SECRET!;
const BASE_URL = "https://data.alpaca.markets/v1beta1/news?sort=desc";

const cache = isDev
  ? new Map<string, { data: any; timestamp: number }>()
  : null;

const TTL = 1000 * 60 * 5; // 5 minutes
const MAX_CACHE_SIZE = 100;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get("ticker")?.toUpperCase() || ""; // optional filter
  const limit = searchParams.get("limit") || "20"; // default limit

  // Build query string
  const url = `${BASE_URL}&limit=${limit}${ticker ? `&symbols=${ticker}` : ""}`;

  const cacheKey = `${ticker}-${limit}`;
  const now = Date.now();

  // DEV cache
  if (isDev && cache) {
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < TTL) {
      console.log(`[Cache:DEV] Returning cached news for ${cacheKey}`);
      return NextResponse.json(cached.data, {
        headers: { "x-source": "cache-dev" },
      });
    }

    if (cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = [...cache.entries()].sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      )[0][0];
      cache.delete(oldestKey);
      console.log(`[Cache:DEV] Evicted oldest entry: ${oldestKey}`);
    }
  }

  // 🌐 Fetch from Alpaca News
  const res = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      "APCA-API-KEY-ID": ALPACA_API_KEY,
      "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
    },
    ...(isDev
      ? {}
      : {
          next: { revalidate: 300, tags: [`alpaca-news-${ticker}`] },
        }),
  });

  const raw = await res.json();

  if (!res.ok) {
    console.error(`[Fetch] Failed for news: ${res.status}`);
    console.error(`[Fetch] Response body:`, raw);
    return NextResponse.json(
      { error: "Failed to fetch news", details: raw },
      { status: res.status }
    );
  }

  const news = raw?.news;
  if (!Array.isArray(news)) {
    console.warn(`[Parse] Unexpected news format:`, raw);
  }

  const parsed = Array.isArray(news)
    ? news.map((item: any) => ({
        id: item.id,
        headline: item.headline,
        summary: item.summary,
        author: item.author,
        source: item.source,
        created_at: item.created_at,
        updated_at: item.updated_at,
        url: item.url,
        symbols: item.symbols,
        images: item.images,
      }))
    : [];

  if (isDev && cache) {
    cache.set(cacheKey, { data: parsed, timestamp: now });
    console.log(`[Cache:DEV] Stored ${cacheKey} with ${parsed.length} items`);
  }

  return NextResponse.json(parsed, {
    headers: { "x-source": isDev ? "fresh-dev" : "fresh-prod" },
  });
}
