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
export function maenvelope(input) {
    const { period = 20, percentage = 2.5, values, maType = 'sma' } = input;
    if (values.length < period) {
        return [];
    }
    // Calculate moving average based on type
    const maValues = maType === 'ema' ? calculateEMA(values, period) : calculateSMA(values, period);
    const result = [];
    for (let i = 0; i < maValues.length; i++) {
        const ma = maValues[i];
        const envelopeDistance = ma * (percentage / 100);
        result.push({
            upper: ma + envelopeDistance,
            middle: ma,
            lower: ma - envelopeDistance
        });
    }
    return result;
}
export class MAEnvelope {
    constructor(input) {
        this.values = [];
        this.period = input.period || 20;
        this.percentage = input.percentage || 2.5;
        this.maType = input.maType || 'sma';
        this.multiplier = 2 / (this.period + 1);
    }
    nextValue(value) {
        this.values.push(value);
        let ma;
        if (this.maType === 'sma') {
            // Need at least period values to calculate SMA
            if (this.values.length < this.period) {
                return undefined;
            }
            // Keep only the last 'period' values for SMA efficiency
            if (this.values.length > this.period) {
                this.values.shift();
            }
            // Calculate SMA
            const sum = this.values.reduce((acc, val) => acc + val, 0);
            ma = sum / this.period;
        }
        else {
            // EMA calculation
            if (this.values.length < this.period) {
                return undefined;
            }
            if (this.currentEMA === undefined) {
                // Initialize EMA with SMA
                const sum = this.values.slice(-this.period).reduce((acc, val) => acc + val, 0);
                this.currentEMA = sum / this.period;
                ma = this.currentEMA;
            }
            else {
                // Calculate EMA
                this.currentEMA = (value - this.currentEMA) * this.multiplier + this.currentEMA;
                ma = this.currentEMA;
            }
        }
        const envelopeDistance = ma * (this.percentage / 100);
        return {
            upper: ma + envelopeDistance,
            middle: ma,
            lower: ma - envelopeDistance
        };
    }
    getResult() {
        if (this.values.length < this.period) {
            return [];
        }
        const lastResult = this.nextValue(this.values[this.values.length - 1]);
        return lastResult ? [lastResult] : [];
    }
}
MAEnvelope.calculate = maenvelope;
