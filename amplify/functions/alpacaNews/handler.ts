function showCharCodes(label: string, value: string | undefined) {
  if (!value) {
    console.log(`${label}: undefined`);
    return;
  }
  const codes = value.split("").map((c) => c.charCodeAt(0));
  console.log(`${label} raw:`, value);
  console.log(`${label} char codes:`, codes);
}

export async function handler(event: any) {
  try {
    const params = event.queryStringParameters || {};
    const ticker = params.ticker?.toUpperCase() || "";
    const limit = params.limit || "20";

    const url = `https://data.alpaca.markets/v1beta1/news?sort=desc&limit=${limit}${ticker ? `&symbols=${ticker}` : ""}`;

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

    const text = await res.text(); // safer than res.json()
    console.log("Raw response:", text);

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: "Failed to fetch", details: text }),
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
