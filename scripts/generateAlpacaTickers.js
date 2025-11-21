const fs = require("fs");
const path = require("path");

const ALPACA_API_KEY = process.env.ALPACA_API_KEY;
const ALPACA_SECRET_KEY = process.env.ALPACA_API_SECRET;
const ALPACA_URL = "https://paper-api.alpaca.markets/v2/assets?attributes=";

const outputPath = path.join(__dirname, "../public/tickers.json");

(async () => {
  try {
    const response = await fetch(ALPACA_URL, {
      method: "GET",
      headers: {
        accept: "application/json",
        "APCA-API-KEY-ID": "PKFQMQCJ5BH6GXTHJI5WVPSVRV",
        "APCA-API-SECRET-KEY": "68K8Y6fn2hGdJ8wadTALk2QcT697cQFzCSUR6FqCGMjB",
      },
    });

    const data = await response.json();

    // console.log("🔍 Raw response from Alpaca:");
    // console.dir(data, { depth: null });

    if (!Array.isArray(data)) {
      console.error("❌ Unexpected response format:");
      console.dir(data, { depth: null });
      throw new Error("Alpaca response is not an array");
    }

    const results = data
      .filter((asset) => asset.tradable && asset.status === "active")
      .map((asset) => ({
        ticker: asset.symbol?.trim(),
        exchange: asset.exchange?.trim(),
        assetType: asset.class?.trim(),
      }))
      .filter(
        (item) =>
          item.ticker &&
          /^[A-Z0-9\-]+$/.test(item.ticker) &&
          item.exchange &&
          item.assetType
      );

    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`✅ Saved ${results.length} tickers to public/tickers.json`);
  } catch (err) {
    console.error("❌ Failed to generate tickers.json:", err);
  }
})();
