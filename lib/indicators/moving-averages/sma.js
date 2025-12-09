export function sma(input) {
    const { period, values } = input;
    if (period <= 0 || period > values.length) {
        return [];
    }
    const result = [];
    for (let i = period - 1; i < values.length; i++) {
        let sum = 0;
        for (let j = i - period + 1; j <= i; j++) {
            sum += values[j];
        }
        result.push(sum / period);
    }
    return result;
}
export class SMA {
    constructor(input) {
        this.values = [];
        this.sum = 0;
        this.period = input.period;
        if (input.values?.length) {
            input.values.forEach(value => this.nextValue(value));
        }
    }
    nextValue(value) {
        this.values.push(value);
        this.sum += value;
        if (this.values.length > this.period) {
            this.sum -= this.values.shift();
        }
        if (this.values.length === this.period) {
            return this.sum / this.period;
        }
        return undefined;
    }
    getResult() {
        if (this.values.length < this.period) {
            return [];
        }
        return [this.sum / this.period];
    }
}
SMA.calculate = sma;
