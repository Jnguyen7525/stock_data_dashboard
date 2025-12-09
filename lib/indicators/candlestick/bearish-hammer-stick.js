export function bearishhammerstick(input) {
    const { candles } = input;
    if (!candles || candles.length === 0) {
        return [];
    }
    const result = [];
    for (let i = 0; i < candles.length; i++) {
        const candle = candles[i];
        const { open, high, low, close } = candle;
        // Bearish Hammer Stick criteria:
        // 1. Bearish candle (close < open)
        // 2. Small real body 
        // 3. Long lower shadow (at least 2 times the body size)
        // 4. Little or no upper shadow
        // 5. Body is in upper half of trading range
        const isBearish = close < open;
        const bodySize = Math.abs(close - open);
        const upperShadow = high - Math.max(open, close);
        const lowerShadow = Math.min(open, close) - low;
        const totalRange = high - low;
        const isBearishHammerStick = totalRange > 0 &&
            isBearish &&
            bodySize < (totalRange / 3) &&
            lowerShadow >= (bodySize * 2) &&
            upperShadow <= bodySize &&
            (Math.min(open, close) - low) >= (totalRange * 0.6);
        result.push(isBearishHammerStick);
    }
    return result;
}
export class BearishHammerStick {
    constructor(input) {
        this.candles = [];
        if (input?.candles?.length) {
            this.candles = [...input.candles];
        }
    }
    nextValue(candle) {
        this.candles.push(candle);
        const result = bearishhammerstick({ candles: [candle] });
        return result[0] || false;
    }
    getResult() {
        return bearishhammerstick({ candles: this.candles });
    }
}
BearishHammerStick.calculate = bearishhammerstick;
