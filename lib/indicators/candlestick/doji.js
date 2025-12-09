export function doji(input) {
    const { candles } = input;
    const result = [];
    for (const candle of candles) {
        const { open, high, low, close } = candle;
        // Calculate body and total range
        const body = Math.abs(close - open);
        const totalRange = high - low;
        // Doji: open and close are very close (within 0.1% of total range)
        const threshold = totalRange * 0.001;
        const isDoji = body <= threshold && totalRange > 0;
        result.push(isDoji);
    }
    return result;
}
export class DojiPattern {
    constructor(input) {
        this.candles = [];
        if (input?.candles?.length) {
            this.candles = [...input.candles];
        }
    }
    nextValue(candle) {
        this.candles.push(candle);
        const { open, high, low, close } = candle;
        const body = Math.abs(close - open);
        const totalRange = high - low;
        const threshold = totalRange * 0.001;
        return body <= threshold && totalRange > 0;
    }
    getResult() {
        if (this.candles.length === 0) {
            return [];
        }
        const lastCandle = this.candles[this.candles.length - 1];
        const { open, high, low, close } = lastCandle;
        const body = Math.abs(close - open);
        const totalRange = high - low;
        const threshold = totalRange * 0.001;
        return [body <= threshold && totalRange > 0];
    }
}
DojiPattern.calculate = doji;
