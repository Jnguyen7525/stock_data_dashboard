export function hammerpatternunconfirmed(input) {
    const { candles } = input;
    if (!candles || candles.length === 0) {
        return [];
    }
    const result = [];
    for (let i = 0; i < candles.length; i++) {
        const candle = candles[i];
        const { open, high, low, close } = candle;
        // Hammer Pattern Unconfirmed criteria (less strict than confirmed hammer):
        // 1. Small real body (body should be less than 1/2 of total range)
        // 2. Long lower shadow (at least 1.5 times the body size)
        // 3. Little or no upper shadow
        // 4. Body is in upper half of trading range
        const bodySize = Math.abs(close - open);
        const upperShadow = high - Math.max(open, close);
        const lowerShadow = Math.min(open, close) - low;
        const totalRange = high - low;
        // Less strict criteria for unconfirmed hammer
        const isHammerUnconfirmed = totalRange > 0 &&
            bodySize < (totalRange / 2) && // Less strict body size
            lowerShadow >= (bodySize * 1.5) && // Less strict lower shadow
            upperShadow <= (bodySize * 1.2) && // More lenient upper shadow
            (Math.min(open, close) - low) >= (totalRange * 0.5); // Body in upper part
        result.push(isHammerUnconfirmed);
    }
    return result;
}
export class HammerPatternUnconfirmed {
    constructor(input) {
        this.candles = [];
        if (input?.candles?.length) {
            this.candles = [...input.candles];
        }
    }
    nextValue(candle) {
        this.candles.push(candle);
        const result = hammerpatternunconfirmed({ candles: [candle] });
        return result[0] || false;
    }
    getResult() {
        return hammerpatternunconfirmed({ candles: this.candles });
    }
}
HammerPatternUnconfirmed.calculate = hammerpatternunconfirmed;
