export async function handler(event: any) {
  const isDev = process.env.NODE_ENV !== "production";
  const ALPACA_API_KEY = process.env.ALPACA_API_KEY!;
  const ALPACA_SECRET_KEY = process.env.ALPACA_API_SECRET!;
  const BASE_URL = "https://data.alpaca.markets/v2/stocks/bars";

  const getStartTime = (granularity: string) => {
    const end = Math.floor(Date.now() / 1000);
    let start;
    let timeframe;

    console.log("from getStartTime at the beginning: ", start, end);

    switch (granularity) {
      case "1Min":
        start = end - 7000 * 60;
        timeframe = "1Min";
        break;
      case "5Min":
        start = end - 9000 * 5 * 60;
        timeframe = "5Min";
        break;
      case "15Min":
        start = end - 9000 * 15 * 60;
        timeframe = "15Min";
        break;
      case "30Min":
        start = end - 10000 * 30 * 60;
        timeframe = "30Min";
        break;
      case "1H":
        start = end - 10000 * 60 * 60;
        timeframe = "1Hour";
        break;
      case "1D":
      default:
        start = end - 750 * 24 * 60 * 60;
        timeframe = "1Day";
        break;
    }

    const formatToRFC3339 = (unixTime: number) =>
      new Date(unixTime * 1000).toISOString();

    const nowUnix = Math.floor(Date.now() / 1000);
    const safeEndUnix =
      granularity === "1Min" ? nowUnix - 60 * 15 : nowUnix - 60 * 60 * 24;

    const startUnix =
      granularity === "1Min"
        ? safeEndUnix - 60 * 60 * 24 * 7
        : safeEndUnix - 60 * 60 * 24 * 365;

    const startStr =
      granularity === "1Min"
        ? formatToRFC3339(startUnix)
        : formatToRFC3339(startUnix).slice(0, 10) + "T00:00:00Z";

    const endStr =
      granularity === "1Min"
        ? formatToRFC3339(safeEndUnix)
        : formatToRFC3339(safeEndUnix).slice(0, 10) + "T00:00:00Z";

    console.log(`Start and End Timestamps:`, startStr, endStr);

    return { timeframe, start: startStr, end: endStr };
  };

  const cache = isDev
    ? new Map<string, { data: any; timestamp: number }>()
    : null;
  const TTL = 1000 * 60 * 5;
  const MAX_CACHE_SIZE = 100;

  try {
    const params = event.queryStringParameters || {};
    const ticker = params.ticker?.toUpperCase() || "AAPL";
    const granularity = params.timeframe || "1D";

    const { timeframe, start, end } = getStartTime(granularity);

    const cacheKey = `${ticker}-${timeframe}-${start}-${end}`;
    const now = Date.now();

    if (isDev && cache) {
      const cached = cache.get(cacheKey);
      if (cached && now - cached.timestamp < TTL) {
        console.log(`[Cache:DEV] Returning cached data for ${cacheKey}`);
        return {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json",
            "x-source": "cache-dev",
          },
          body: JSON.stringify(cached.data),
        };
      }

      if (cache.size >= MAX_CACHE_SIZE) {
        const oldestKey = [...cache.entries()].sort(
          (a, b) => a[1].timestamp - b[1].timestamp
        )[0][0];
        cache.delete(oldestKey);
        console.log(`[Cache:DEV] Evicted oldest entry: ${oldestKey}`);
      }
    }

    const url = `${BASE_URL}?symbols=${ticker}&timeframe=${granularity}&start=${start}&end=${end}&limit=1000&adjustment=raw&feed=sip&sort=asc`;

    const apiKey = (process.env.ALPACA_API_KEY || "")
      .trim()
      .replace(/^"|"$/g, "");
    const apiSecret = (process.env.ALPACA_API_SECRET || "")
      .trim()
      .replace(/^"|"$/g, "");

    const res = await fetch(url, {
      headers: {
        accept: "application/json",
        "APCA-API-KEY-ID": apiKey,
        "APCA-API-SECRET-KEY": apiSecret,
      },
    });

    const raw = await res.json();

    if (!res.ok) {
      console.error(`[Fetch] Failed for ${ticker}: ${res.status}`);
      console.error(`[Fetch] Response body:`, raw);
      return {
        statusCode: res.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Failed to fetch data", details: raw }),
      };
    }

    const bars = raw?.bars?.[ticker];
    if (!Array.isArray(bars)) {
      console.warn(`[Parse] Unexpected bars format for ${ticker}:`, raw);
    }

    const parsed = Array.isArray(bars)
      ? bars.map((bar: any) => ({
          time: bar.t,
          open: bar.o,
          high: bar.h,
          low: bar.l,
          close: bar.c,
          volume: bar.v,
        }))
      : [];

    if (isDev && cache) {
      cache.set(cacheKey, { data: parsed, timestamp: now });
      console.log(
        `[Cache:DEV] Stored ${cacheKey} with ${parsed.length} points`
      );
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "x-source": isDev ? "fresh-dev" : "fresh-prod",
      },
      body: JSON.stringify(parsed),
    };
  } catch (err: any) {
    console.error("Handler error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
}
