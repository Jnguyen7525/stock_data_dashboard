import { defineFunction, secret } from "@aws-amplify/backend";

export const alpacaNews = defineFunction({
  name: "alpacaNews",
  entry: "./handler.ts", // points to your handler file
  environment: {
    ALPACA_API_KEY: secret("ALPACA_API_KEY"),
    ALPACA_API_SECRET: secret("ALPACA_API_SECRET"),
  },
});
