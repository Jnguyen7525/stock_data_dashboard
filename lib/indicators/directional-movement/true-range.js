export function truerange(input) {
    const { high, low, close } = input;
    if (high.length !== low.length || low.length !== close.length || close.length < 2) {
        return [];
    }
    const result = [];
    // Skip first value since we need previous close
    for (let i = 1; i < close.length; i++) {
        const highLow = high[i] - low[i];
        const highPrevClose = Math.abs(high[i] - close[i - 1]);
        const lowPrevClose = Math.abs(low[i] - close[i - 1]);
        const tr = Math.max(highLow, highPrevClose, lowPrevClose);
        result.push(tr);
    }
    return result;
}
export class TrueRange {
    constructor(input) {
        this.highValues = [];
        this.lowValues = [];
        this.closeValues = [];
        if (input?.high?.length) {
            const { high, low, close } = input;
            for (let i = 0; i < Math.min(high.length, low.length, close.length); i++) {
                this.nextValue(high[i], low[i], close[i]);
            }
        }
    }
    nextValue(high, low, close) {
        this.highValues.push(high);
        this.lowValues.push(low);
        this.closeValues.push(close);
        // Need at least 2 values to calculate true range
        if (this.closeValues.length < 2) {
            return undefined;
        }
        const currentHigh = high;
        const currentLow = low;
        const previousClose = this.closeValues[this.closeValues.length - 2];
        const highLow = currentHigh - currentLow;
        const highPrevClose = Math.abs(currentHigh - previousClose);
        const lowPrevClose = Math.abs(currentLow - previousClose);
        return Math.max(highLow, highPrevClose, lowPrevClose);
    }
    getResult() {
        if (this.closeValues.length < 2) {
            return [];
        }
        const currentHigh = this.highValues[this.highValues.length - 1];
        const currentLow = this.lowValues[this.lowValues.length - 1];
        const previousClose = this.closeValues[this.closeValues.length - 2];
        const highLow = currentHigh - currentLow;
        const highPrevClose = Math.abs(currentHigh - previousClose);
        const lowPrevClose = Math.abs(currentLow - previousClose);
        return [Math.max(highLow, highPrevClose, lowPrevClose)];
    }
}
TrueRange.calculate = truerange;
