export function bearishinvertedhammer(input) {
    const { candles } = input;
    if (!candles || candles.length === 0) {
        return [];
    }
    const result = [];
    for (let i = 0; i < candles.length; i++) {
        const candle = candles[i];
        const { open, high, low, close } = candle;
        // Bearish Inverted Hammer criteria:
        // 1. Small real body (can be bullish or bearish)
        // 2. Long upper shadow (at least 2 times the body size)
        // 3. Little or no lower shadow
        // 4. Body is in the lower part of the trading range
        // 5. Should appear after an uptrend (context dependent)
        // 6. Similar to shooting star but with different context
        const bodySize = Math.abs(close - open);
        const upperShadow = high - Math.max(open, close);
        const lowerShadow = Math.min(open, close) - low;
        const totalRange = high - low;
        // Bearish Inverted Hammer criteria
        const isBearishInvertedHammer = totalRange > 0 &&
            bodySize < (totalRange / 3) && // Small body
            upperShadow >= (bodySize * 2) && // Long upper shadow
            lowerShadow <= (bodySize * 0.5) && // Small or no lower shadow
            (Math.min(open, close) - low) <= (totalRange * 0.3); // Body in lower part
        result.push(isBearishInvertedHammer);
    }
    return result;
}
export class BearishInvertedHammer {
    constructor(input) {
        this.candles = [];
        if (input?.candles?.length) {
            this.candles = [...input.candles];
        }
    }
    nextValue(candle) {
        this.candles.push(candle);
        const result = bearishinvertedhammer({ candles: [candle] });
        return result[0] || false;
    }
    getResult() {
        return bearishinvertedhammer({ candles: this.candles });
    }
}
BearishInvertedHammer.calculate = bearishinvertedhammer;
