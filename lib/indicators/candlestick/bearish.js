export function bearish(input) {
    const { candles } = input;
    if (!candles || candles.length === 0) {
        return [];
    }
    const result = [];
    for (let i = 0; i < candles.length; i++) {
        const candle = candles[i];
        const { open, close } = candle;
        // Simple bearish criteria: close < open
        const isBearish = close < open;
        result.push(isBearish);
    }
    return result;
}
export class Bearish {
    constructor(input) {
        this.candles = [];
        if (input?.candles?.length) {
            this.candles = [...input.candles];
        }
    }
    nextValue(candle) {
        this.candles.push(candle);
        return candle.close < candle.open;
    }
    getResult() {
        return bearish({ candles: this.candles });
    }
}
Bearish.calculate = bearish;
