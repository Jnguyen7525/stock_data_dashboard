function calculateSMA(values, period) {
    if (values.length < period) {
        return [];
    }
    const result = [];
    for (let i = period - 1; i < values.length; i++) {
        const sum = values.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
        result.push(sum / period);
    }
    return result;
}
function calculateEMA(values, period) {
    if (values.length < period) {
        return [];
    }
    const result = [];
    const multiplier = 2 / (period + 1);
    // Calculate initial SMA for the first EMA value
    const initialSum = values.slice(0, period).reduce((acc, val) => acc + val, 0);
    let ema = initialSum / period;
    result.push(ema);
    // Calculate subsequent EMA values
    for (let i = period; i < values.length; i++) {
        ema = (values[i] - ema) * multiplier + ema;
        result.push(ema);
    }
    return result;
}
export function priceoscillator(input) {
    const { fastPeriod = 12, slowPeriod = 26, values, maType = 'ema' } = input;
    if (values.length < slowPeriod) {
        return [];
    }
    // Calculate fast and slow moving averages
    const fastMA = maType === 'ema' ? calculateEMA(values, fastPeriod) : calculateSMA(values, fastPeriod);
    const slowMA = maType === 'ema' ? calculateEMA(values, slowPeriod) : calculateSMA(values, slowPeriod);
    const result = [];
    // Align the arrays (slow MA starts later)
    const offset = slowPeriod - fastPeriod;
    for (let i = 0; i < slowMA.length; i++) {
        const fastValue = fastMA[i + offset];
        const slowValue = slowMA[i];
        // Price Oscillator = Fast MA - Slow MA
        const oscillator = fastValue - slowValue;
        result.push(oscillator);
    }
    return result;
}
export class PriceOscillator {
    constructor(input) {
        this.values = [];
        this.fastPeriod = input.fastPeriod || 12;
        this.slowPeriod = input.slowPeriod || 26;
        this.maType = input.maType || 'ema';
        this.fastMultiplier = 2 / (this.fastPeriod + 1);
        this.slowMultiplier = 2 / (this.slowPeriod + 1);
    }
    nextValue(value) {
        this.values.push(value);
        if (this.maType === 'sma') {
            // Need at least slowPeriod values to calculate both SMAs
            if (this.values.length < this.slowPeriod) {
                return undefined;
            }
            // Keep only necessary values for SMA efficiency
            if (this.values.length > this.slowPeriod) {
                this.values.shift();
            }
            // Calculate SMAs
            const fastSum = this.values.slice(-this.fastPeriod).reduce((acc, val) => acc + val, 0);
            const slowSum = this.values.reduce((acc, val) => acc + val, 0);
            const fastSMA = fastSum / this.fastPeriod;
            const slowSMA = slowSum / this.slowPeriod;
            return fastSMA - slowSMA;
        }
        else {
            // EMA calculation
            if (this.values.length < this.slowPeriod) {
                return undefined;
            }
            if (this.fastEMA === undefined || this.slowEMA === undefined) {
                // Initialize EMAs with SMAs
                const fastSum = this.values.slice(-this.fastPeriod).reduce((acc, val) => acc + val, 0);
                const slowSum = this.values.slice(-this.slowPeriod).reduce((acc, val) => acc + val, 0);
                this.fastEMA = fastSum / this.fastPeriod;
                this.slowEMA = slowSum / this.slowPeriod;
                return this.fastEMA - this.slowEMA;
            }
            else {
                // Calculate EMAs
                this.fastEMA = (value - this.fastEMA) * this.fastMultiplier + this.fastEMA;
                this.slowEMA = (value - this.slowEMA) * this.slowMultiplier + this.slowEMA;
                return this.fastEMA - this.slowEMA;
            }
        }
    }
    getResult() {
        if (this.values.length < this.slowPeriod) {
            return [];
        }
        const lastResult = this.nextValue(this.values[this.values.length - 1]);
        return lastResult !== undefined ? [lastResult] : [];
    }
}
PriceOscillator.calculate = priceoscillator;
