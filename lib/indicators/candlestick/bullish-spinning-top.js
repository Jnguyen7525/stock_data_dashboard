export function bullishspinningtop(input) {
    const { candles } = input;
    if (!candles || candles.length === 0) {
        return [];
    }
    const result = [];
    for (let i = 0; i < candles.length; i++) {
        const candle = candles[i];
        const { open, high, low, close } = candle;
        // Bullish Spinning Top criteria:
        // 1. Bullish candle (close > open)
        // 2. Small real body (body should be small relative to total range)
        // 3. Long upper and lower shadows (both should be at least equal to body size)
        // 4. Body is roughly in the middle of the trading range
        const isBullish = close > open;
        const bodySize = Math.abs(close - open);
        const upperShadow = high - Math.max(open, close);
        const lowerShadow = Math.min(open, close) - low;
        const totalRange = high - low;
        const isBullishSpinningTop = totalRange > 0 &&
            isBullish &&
            bodySize < (totalRange / 3) && // Small body
            upperShadow >= bodySize && // Long upper shadow
            lowerShadow >= bodySize && // Long lower shadow
            bodySize > 0; // Must have some body (not a doji)
        result.push(isBullishSpinningTop);
    }
    return result;
}
export class BullishSpinningTop {
    constructor(input) {
        this.candles = [];
        if (input?.candles?.length) {
            this.candles = [...input.candles];
        }
    }
    nextValue(candle) {
        this.candles.push(candle);
        const result = bullishspinningtop({ candles: [candle] });
        return result[0] || false;
    }
    getResult() {
        return bullishspinningtop({ candles: this.candles });
    }
}
BullishSpinningTop.calculate = bullishspinningtop;
