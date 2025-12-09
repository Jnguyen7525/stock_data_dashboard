function calculateSMA(values, period, endIndex) {
    if (endIndex < period - 1) {
        return 0;
    }
    let sum = 0;
    for (let i = endIndex - period + 1; i <= endIndex; i++) {
        sum += values[i];
    }
    return sum / period;
}
export function dpo(input) {
    const { period = 21, values } = input;
    if (values.length < period) {
        return [];
    }
    const result = [];
    const lookback = Math.floor(period / 2) + 1; // Displacement for SMA
    // Start from period - 1 to have enough data for SMA
    for (let i = period - 1; i < values.length; i++) {
        // Calculate SMA displaced by (period/2 + 1) periods ago
        const smaIndex = i - lookback;
        if (smaIndex >= period - 1) {
            const sma = calculateSMA(values, period, smaIndex);
            const dpoValue = values[i] - sma;
            result.push(dpoValue);
        }
    }
    return result;
}
export class DPO {
    constructor(input) {
        this.values = [];
        this.period = input.period || 21;
        this.lookback = Math.floor(this.period / 2) + 1;
    }
    nextValue(value) {
        this.values.push(value);
        // Need enough values to calculate DPO
        const minRequired = this.period + this.lookback - 1;
        if (this.values.length < minRequired) {
            return undefined;
        }
        // Keep only necessary values for efficiency
        const maxKeep = this.period + this.lookback;
        if (this.values.length > maxKeep) {
            this.values.shift();
        }
        // Current price index
        const currentIndex = this.values.length - 1;
        // SMA index (displaced back by lookback periods)
        const smaIndex = currentIndex - this.lookback;
        // Calculate SMA at the displaced index
        if (smaIndex >= this.period - 1) {
            const sma = calculateSMA(this.values, this.period, smaIndex);
            const dpoValue = this.values[currentIndex] - sma;
            return dpoValue;
        }
        return undefined;
    }
    getResult() {
        const minRequired = this.period + this.lookback - 1;
        if (this.values.length < minRequired) {
            return [];
        }
        const lastResult = this.nextValue(this.values[this.values.length - 1]);
        return lastResult !== undefined ? [lastResult] : [];
    }
}
DPO.calculate = dpo;
