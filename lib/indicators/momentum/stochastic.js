import { sma } from '../moving-averages/sma';
export function stochastic(input) {
    const { period = 14, signalPeriod = 3, high, low, close } = input;
    if (high.length !== low.length || low.length !== close.length || close.length < period) {
        return [];
    }
    const result = [];
    // Calculate %K values
    const kValues = [];
    for (let i = period - 1; i < close.length; i++) {
        const highestHigh = Math.max(...high.slice(i - period + 1, i + 1));
        const lowestLow = Math.min(...low.slice(i - period + 1, i + 1));
        let kValue;
        if (highestHigh === lowestLow) {
            kValue = 50; // Avoid division by zero
        }
        else {
            kValue = ((close[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
        }
        kValues.push(kValue);
    }
    // Calculate %D (SMA of %K)
    const dValues = sma({ period: signalPeriod, values: kValues });
    // Combine results
    for (let i = 0; i < kValues.length; i++) {
        const dValue = i >= signalPeriod - 1 ? dValues[i - signalPeriod + 1] : undefined;
        result.push({
            k: kValues[i],
            d: dValue
        });
    }
    return result;
}
export class Stochastic {
    constructor(input) {
        this.highValues = [];
        this.lowValues = [];
        this.closeValues = [];
        this.kValues = [];
        this.period = input.period || 14;
        this.signalPeriod = input.signalPeriod || 3;
        // Import SMA class for D calculation - we'll handle this inline to avoid circular imports
        this.dCalculator = {
            values: [],
            period: this.signalPeriod,
            nextValue: (value) => {
                this.dCalculator.values.push(value);
                if (this.dCalculator.values.length > this.dCalculator.period) {
                    this.dCalculator.values.shift();
                }
                if (this.dCalculator.values.length === this.dCalculator.period) {
                    return this.dCalculator.values.reduce((sum, val) => sum + val, 0) / this.dCalculator.period;
                }
                return undefined;
            }
        };
    }
    nextValue(high, low, close) {
        this.highValues.push(high);
        this.lowValues.push(low);
        this.closeValues.push(close);
        // Keep only the required period
        if (this.highValues.length > this.period) {
            this.highValues.shift();
            this.lowValues.shift();
            this.closeValues.shift();
        }
        if (this.highValues.length === this.period) {
            const highestHigh = Math.max(...this.highValues);
            const lowestLow = Math.min(...this.lowValues);
            const currentClose = close;
            let kValue;
            if (highestHigh === lowestLow) {
                kValue = 50;
            }
            else {
                kValue = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
            }
            this.kValues.push(kValue);
            const dValue = this.dCalculator.nextValue(kValue);
            return {
                k: kValue,
                d: dValue
            };
        }
        return undefined;
    }
    getResult() {
        if (this.kValues.length === 0) {
            return [];
        }
        const lastK = this.kValues[this.kValues.length - 1];
        const lastD = this.dCalculator.values.length === this.signalPeriod
            ? this.dCalculator.values.reduce((sum, val) => sum + val, 0) / this.signalPeriod
            : undefined;
        return [{
                k: lastK,
                d: lastD
            }];
    }
}
Stochastic.calculate = stochastic;
