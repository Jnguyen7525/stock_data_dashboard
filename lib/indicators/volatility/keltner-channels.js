import { ema } from '../moving-averages/ema';
import { atr } from './atr';
export function keltnerchannel(input) {
    const { high, low, close, period = 20, multiplier = 2 } = input;
    if (!high || !low || !close ||
        high.length !== low.length ||
        low.length !== close.length ||
        high.length === 0) {
        return [];
    }
    // Calculate EMA of close prices (middle line)
    const middleValues = ema({ period, values: close });
    // Calculate ATR
    const atrValues = atr({ high, low, close, period });
    const result = [];
    // Align arrays - ATR and EMA might have different starting points
    for (let i = 0; i < Math.min(middleValues.length, atrValues.length); i++) {
        const middle = middleValues[i];
        const atrValue = atrValues[i];
        result.push({
            middle,
            upper: middle + (multiplier * atrValue),
            lower: middle - (multiplier * atrValue)
        });
    }
    return result;
}
export class KeltnerChannels {
    constructor(input) {
        this.highValues = [];
        this.lowValues = [];
        this.closeValues = [];
        this.period = input.period || 20;
        this.multiplier = input.multiplier || 2;
        if (input.high && input.low && input.close &&
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
        const result = keltnerchannel({
            high: this.highValues,
            low: this.lowValues,
            close: this.closeValues,
            period: this.period,
            multiplier: this.multiplier
        });
        if (result.length > 0) {
            return result[result.length - 1];
        }
        return undefined;
    }
    getResult() {
        return keltnerchannel({
            high: this.highValues,
            low: this.lowValues,
            close: this.closeValues,
            period: this.period,
            multiplier: this.multiplier
        });
    }
}
KeltnerChannels.calculate = keltnerchannel;
