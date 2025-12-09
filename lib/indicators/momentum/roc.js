export function roc(input) {
    const { period, values } = input;
    if (period <= 0 || values.length <= period) {
        return [];
    }
    const result = [];
    for (let i = period; i < values.length; i++) {
        const currentPrice = values[i];
        const pastPrice = values[i - period];
        if (pastPrice === 0) {
            result.push(0);
        }
        else {
            const rocValue = ((currentPrice - pastPrice) / pastPrice) * 100;
            result.push(rocValue);
        }
    }
    return result;
}
export class ROC {
    constructor(input) {
        this.values = [];
        this.period = input.period;
        if (input.values?.length) {
            input.values.forEach(value => this.nextValue(value));
        }
    }
    nextValue(value) {
        this.values.push(value);
        if (this.values.length > this.period + 1) {
            this.values.shift();
        }
        if (this.values.length === this.period + 1) {
            const currentPrice = this.values[this.values.length - 1];
            const pastPrice = this.values[0];
            if (pastPrice === 0) {
                return 0;
            }
            return ((currentPrice - pastPrice) / pastPrice) * 100;
        }
        return undefined;
    }
    getResult() {
        if (this.values.length < this.period + 1) {
            return [];
        }
        const currentPrice = this.values[this.values.length - 1];
        const pastPrice = this.values[0];
        if (pastPrice === 0) {
            return [0];
        }
        return [((currentPrice - pastPrice) / pastPrice) * 100];
    }
}
ROC.calculate = roc;
