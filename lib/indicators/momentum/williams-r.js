export function williamsr(input) {
    const { period = 14, high, low, close } = input;
    if (high.length !== low.length || low.length !== close.length || close.length < period) {
        return [];
    }
    const result = [];
    for (let i = period - 1; i < close.length; i++) {
        const highestHigh = Math.max(...high.slice(i - period + 1, i + 1));
        const lowestLow = Math.min(...low.slice(i - period + 1, i + 1));
        let williamsR;
        if (highestHigh === lowestLow) {
            williamsR = -50; // Middle value when no range
        }
        else {
            williamsR = ((highestHigh - close[i]) / (highestHigh - lowestLow)) * -100;
        }
        result.push(williamsR);
    }
    return result;
}
export class WilliamsR {
    constructor(input) {
        this.highValues = [];
        this.lowValues = [];
        this.closeValues = [];
        this.period = input.period || 14;
    }
    nextValue(high, low, close) {
        this.highValues.push(high);
        this.lowValues.push(low);
        this.closeValues.push(close);
        if (this.highValues.length > this.period) {
            this.highValues.shift();
            this.lowValues.shift();
            this.closeValues.shift();
        }
        if (this.highValues.length === this.period) {
            const highestHigh = Math.max(...this.highValues);
            const lowestLow = Math.min(...this.lowValues);
            const currentClose = close;
            if (highestHigh === lowestLow) {
                return -50;
            }
            return ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
        }
        return undefined;
    }
    getResult() {
        if (this.highValues.length < this.period) {
            return [];
        }
        const highestHigh = Math.max(...this.highValues);
        const lowestLow = Math.min(...this.lowValues);
        const currentClose = this.closeValues[this.closeValues.length - 1];
        if (highestHigh === lowestLow) {
            return [-50];
        }
        return [((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100];
    }
}
WilliamsR.calculate = williamsr;
