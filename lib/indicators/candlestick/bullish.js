export function bullish(input) {
    const { candles } = input;
    if (!candles || candles.length === 0) {
        return [];
    }
    const result = [];
    for (let i = 0; i < candles.length; i++) {
        const candle = candles[i];
        const { open, close } = candle;
        // Simple bullish criteria: close > open
        const isBullish = close > open;
        result.push(isBullish);
    }
    return result;
}
export class Bullish {
    constructor(input) {
        this.candles = [];
        if (input?.candles?.length) {
            this.candles = [...input.candles];
        }
    }
    nextValue(candle) {
        this.candles.push(candle);
        return candle.close > candle.open;
    }
    getResult() {
        return bullish({ candles: this.candles });
    }
}
Bullish.calculate = bullish;
