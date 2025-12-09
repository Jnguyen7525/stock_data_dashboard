export function marubozu(input) {
    const { candles } = input;
    if (!candles || candles.length === 0) {
        return [];
    }
    const result = [];
    for (let i = 0; i < candles.length; i++) {
        const candle = candles[i];
        const { open, high, low, close } = candle;
        // Calculate body size and shadows
        const bodySize = Math.abs(close - open);
        const upperShadow = high - Math.max(open, close);
        const lowerShadow = Math.min(open, close) - low;
        const totalRange = high - low;
        // Marubozu criteria:
        // 1. Large real body (body should be most of the total range)
        // 2. Little or no shadows (shadows should be very small relative to body)
        // 3. Open and close are at or very near the high and low
        const shadowTolerance = totalRange * 0.05; // 5% tolerance for shadows
        const isMarubozu = totalRange > 0 &&
            bodySize >= (totalRange * 0.9) && // Body is at least 90% of range
            upperShadow <= shadowTolerance &&
            lowerShadow <= shadowTolerance;
        result.push(isMarubozu);
    }
    return result;
}
export class MarubozuPattern {
    constructor(input) {
        this.candles = [];
        if (input?.candles?.length) {
            this.candles = [...input.candles];
        }
    }
    nextValue(candle) {
        this.candles.push(candle);
        const result = marubozu({ candles: [candle] });
        return result[0] || false;
    }
    getResult() {
        return marubozu({ candles: this.candles });
    }
}
MarubozuPattern.calculate = marubozu;
