import { sma } from '../moving-averages/sma';
function standardDeviation(values, mean) {
    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
}
export function bollingerbands(input) {
    const { period = 20, values = [], stdDev = 2 } = input;
    if (period <= 0 || values.length < period) {
        return [];
    }
    const result = [];
    const smaValues = sma({ period, values });
    for (let i = 0; i < smaValues.length; i++) {
        const startIdx = i;
        const endIdx = i + period;
        const periodValues = values.slice(startIdx, endIdx);
        const middle = smaValues[i];
        const sd = standardDeviation(periodValues, middle);
        const upper = middle + (stdDev * sd);
        const lower = middle - (stdDev * sd);
        const pb = (values[endIdx - 1] - lower) / (upper - lower);
        const width = (upper - lower) / middle;
        result.push({
            upper,
            middle,
            lower,
            pb,
            width
        });
    }
    return result;
}
export class BollingerBands {
    constructor(input) {
        this.values = [];
        this.period = input.period || 20;
        this.stdDev = input.stdDev || 2;
        if (input.values?.length) {
            input.values.forEach(value => this.nextValue(value));
        }
    }
    nextValue(value) {
        this.values.push(value);
        if (this.values.length > this.period) {
            this.values.shift();
        }
        if (this.values.length === this.period) {
            const sum = this.values.reduce((acc, val) => acc + val, 0);
            const middle = sum / this.period;
            const sd = standardDeviation(this.values, middle);
            const upper = middle + (this.stdDev * sd);
            const lower = middle - (this.stdDev * sd);
            const pb = (value - lower) / (upper - lower);
            const width = (upper - lower) / middle;
            return {
                upper,
                middle,
                lower,
                pb,
                width
            };
        }
        return undefined;
    }
    getResult() {
        if (this.values.length < this.period) {
            return [];
        }
        const sum = this.values.reduce((acc, val) => acc + val, 0);
        const middle = sum / this.period;
        const sd = standardDeviation(this.values, middle);
        const upper = middle + (this.stdDev * sd);
        const lower = middle - (this.stdDev * sd);
        const lastValue = this.values[this.values.length - 1];
        const pb = (lastValue - lower) / (upper - lower);
        const width = (upper - lower) / middle;
        return [{
                upper,
                middle,
                lower,
                pb,
                width
            }];
    }
}
BollingerBands.calculate = bollingerbands;
