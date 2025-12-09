export function dragonflydoji(input) {
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
        // Dragonfly Doji criteria:
        // 1. Very small or no real body (open ≈ close)
        // 2. Long lower shadow
        // 3. Little or no upper shadow
        // 4. Open and close are at or near the high of the session
        const bodyTolerance = totalRange * 0.05; // 5% tolerance for body
        const shadowTolerance = totalRange * 0.05; // 5% tolerance for upper shadow
        const isDragonflyDoji = totalRange > 0 &&
            bodySize <= bodyTolerance &&
            upperShadow <= shadowTolerance &&
            lowerShadow >= (totalRange * 0.6) && // Long lower shadow
            Math.max(open, close) >= (high - shadowTolerance); // Body near high
        result.push(isDragonflyDoji);
    }
    return result;
}
export class DragonflyDojiPattern {
    constructor(input) {
        this.candles = [];
        if (input?.candles?.length) {
            this.candles = [...input.candles];
        }
    }
    nextValue(candle) {
        this.candles.push(candle);
        const result = dragonflydoji({ candles: [candle] });
        return result[0] || false;
    }
    getResult() {
        return dragonflydoji({ candles: this.candles });
    }
}
DragonflyDojiPattern.calculate = dragonflydoji;
