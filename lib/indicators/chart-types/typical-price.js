export function typicalprice(input) {
    const { high, low, close } = input;
    if (!high || !low || !close ||
        high.length !== low.length ||
        low.length !== close.length ||
        high.length === 0) {
        return [];
    }
    const result = [];
    for (let i = 0; i < high.length; i++) {
        // Typical Price = (High + Low + Close) / 3
        const typicalPrice = (high[i] + low[i] + close[i]) / 3;
        result.push(typicalPrice);
    }
    return result;
}
export class TypicalPrice {
    constructor(input) {
        this.highValues = [];
        this.lowValues = [];
        this.closeValues = [];
        if (input?.high && input.low && input.close &&
            input.high.length === input.low.length &&
            input.low.length === input.close.length) {
            for (let i = 0; i < input.high.length; i++) {
                this.nextValue(input.high[i], input.low[i], input.close[i]);
            }
        }
    }
    nextValue(high, low, close) {
        this.highValues.push(high);
        this.lowValues.push(low);
        this.closeValues.push(close);
        // Return the typical price for current values
        return (high + low + close) / 3;
    }
    getResult() {
        return typicalprice({
            high: this.highValues,
            low: this.lowValues,
            close: this.closeValues
        });
    }
}
TypicalPrice.calculate = typicalprice;
