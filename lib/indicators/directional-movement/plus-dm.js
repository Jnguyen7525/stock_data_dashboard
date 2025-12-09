export function plusdm(input) {
    const { high, low, period = 14 } = input;
    if (!high || !low || high.length !== low.length || high.length < 2) {
        return [];
    }
    const plusDMValues = [];
    // Calculate raw Plus DM values
    for (let i = 1; i < high.length; i++) {
        const upMove = high[i] - high[i - 1];
        const downMove = low[i - 1] - low[i];
        // Plus DM = upMove if upMove > downMove and upMove > 0, else 0
        let plusDM = 0;
        if (upMove > downMove && upMove > 0) {
            plusDM = upMove;
        }
        plusDMValues.push(plusDM);
    }
    if (plusDMValues.length < period) {
        return [];
    }
    const result = [];
    // Calculate initial smoothed Plus DM (simple average of first period)
    let smoothedPlusDM = plusDMValues.slice(0, period).reduce((sum, val) => sum + val, 0);
    result.push(smoothedPlusDM);
    // Calculate subsequent smoothed Plus DM using Wilder's smoothing
    for (let i = period; i < plusDMValues.length; i++) {
        smoothedPlusDM = ((smoothedPlusDM * (period - 1)) + plusDMValues[i]) / period;
        result.push(smoothedPlusDM);
    }
    return result;
}
export class PlusDM {
    constructor(input) {
        this.highValues = [];
        this.lowValues = [];
        this.period = input.period || 14;
        if (input.high && input.low && input.high.length === input.low.length) {
            for (let i = 0; i < input.high.length; i++) {
                this.nextValue(input.high[i], input.low[i]);
            }
        }
    }
    nextValue(high, low) {
        this.highValues.push(high);
        this.lowValues.push(low);
        const result = plusdm({
            high: this.highValues,
            low: this.lowValues,
            period: this.period
        });
        if (result.length > 0) {
            return result[result.length - 1];
        }
        return undefined;
    }
    getResult() {
        return plusdm({
            high: this.highValues,
            low: this.lowValues,
            period: this.period
        });
    }
}
PlusDM.calculate = plusdm;
