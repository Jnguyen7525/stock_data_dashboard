export function wma(input) {
    const { period, values } = input;
    if (period <= 0 || period > values.length) {
        return [];
    }
    const result = [];
    for (let i = period - 1; i < values.length; i++) {
        let weightedSum = 0;
        let weightSum = 0;
        for (let j = 0; j < period; j++) {
            const weight = j + 1;
            weightedSum += values[i - period + 1 + j] * weight;
            weightSum += weight;
        }
        result.push(weightedSum / weightSum);
    }
    return result;
}
export class WMA {
    constructor(input) {
        this.values = [];
        this.period = input.period;
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
            let weightedSum = 0;
            let weightSum = 0;
            for (let i = 0; i < this.period; i++) {
                const weight = i + 1;
                weightedSum += this.values[i] * weight;
                weightSum += weight;
            }
            return weightedSum / weightSum;
        }
        return undefined;
    }
    getResult() {
        if (this.values.length < this.period) {
            return [];
        }
        let weightedSum = 0;
        let weightSum = 0;
        for (let i = 0; i < this.period; i++) {
            const weight = i + 1;
            weightedSum += this.values[i] * weight;
            weightSum += weight;
        }
        return [weightedSum / weightSum];
    }
}
WMA.calculate = wma;
