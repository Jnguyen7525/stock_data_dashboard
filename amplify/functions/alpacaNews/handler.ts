export async function handler(event: any) {
  try {
    const params = event.queryStringParameters || {};
    const ticker = params.ticker?.toUpperCase() || "";
    const limit = params.limit || "20";

    const url = `https://data.alpaca.markets/v1beta1/news?sort=desc&limit=${limit}${ticker ? `&symbols=${ticker}` : ""}`;

    const res = await fetch(url, {
      headers: {
        accept: "application/json",
        "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
        "APCA-API-SECRET-KEY": process.env.ALPACA_API_SECRET!,
      },
    });

    const text = await res.text(); // safer than res.json()
    console.log("Raw response:", text);

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: "Failed to fetch news", details: text }),
      };
    }

    const raw = JSON.parse(text);
    const parsed = Array.isArray(raw?.news)
      ? raw.news.map((item: any) => ({
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

    return { statusCode: 200, body: JSON.stringify(parsed) };
  } catch (err: any) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
