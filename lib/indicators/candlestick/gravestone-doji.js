export function gravestonedoji(input) {
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
        // Gravestone Doji criteria:
        // 1. Very small or no real body (open ≈ close)
        // 2. Long upper shadow
        // 3. Little or no lower shadow
        // 4. Open and close are at or near the low of the session
        const bodyTolerance = totalRange * 0.05; // 5% tolerance for body
        const shadowTolerance = totalRange * 0.05; // 5% tolerance for lower shadow
        const isGravestoneDoji = totalRange > 0 &&
            bodySize <= bodyTolerance &&
            lowerShadow <= shadowTolerance &&
            upperShadow >= (totalRange * 0.6) && // Long upper shadow
            Math.min(open, close) <= (low + shadowTolerance); // Body near low
        result.push(isGravestoneDoji);
    }
    return result;
}
export class GravestoneDojiPattern {
    constructor(input) {
        this.candles = [];
        if (input?.candles?.length) {
            this.candles = [...input.candles];
        }
    }
    nextValue(candle) {
        this.candles.push(candle);
        const result = gravestonedoji({ candles: [candle] });
        return result[0] || false;
    }
    getResult() {
        return gravestonedoji({ candles: this.candles });
    }
}
GravestoneDojiPattern.calculate = gravestonedoji;
