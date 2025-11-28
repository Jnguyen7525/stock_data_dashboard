import { defineFunction, secret } from "@aws-amplify/backend";

export const bars = defineFunction({
  name: "bars",
  entry: "./handler.ts", // points to the handler you just wrote
  environment: {
    ALPACA_API_KEY: secret("ALPACA_API_KEY"),
    ALPACA_API_SECRET: secret("ALPACA_API_SECRET"),
  },
});
