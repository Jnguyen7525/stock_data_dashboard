export function adl(input) {
    const { high, low, close, volume } = input;
    if (high.length !== low.length || low.length !== close.length || close.length !== volume.length) {
        return [];
    }
    const result = [];
    let cumulativeADL = 0;
    for (let i = 0; i < close.length; i++) {
        const h = high[i];
        const l = low[i];
        const c = close[i];
        const v = volume[i];
        // Calculate Money Flow Multiplier (exact reference implementation)
        let moneyFlowMultiplier = ((c - l) - (h - c)) / (h - l);
        moneyFlowMultiplier = isNaN(moneyFlowMultiplier) ? 1 : moneyFlowMultiplier;
        // Calculate Money Flow Volume  
        const moneyFlowVolume = moneyFlowMultiplier * v;
        // Add to cumulative ADL (don't round internal state, only output)
        cumulativeADL += moneyFlowVolume;
        result.push(Math.round(cumulativeADL));
    }
    return result;
}
export class ADL {
    constructor(input) {
        this.cumulativeADL = 0;
        if (input?.high?.length) {
            const { high, low, close, volume } = input;
            for (let i = 0; i < Math.min(high.length, low.length, close.length, volume.length); i++) {
                this.nextValue(high[i], low[i], close[i], volume[i]);
            }
        }
    }
    nextValue(high, low, close, volume) {
        // Calculate Money Flow Multiplier (exact reference implementation)
        let moneyFlowMultiplier = ((close - low) - (high - close)) / (high - low);
        moneyFlowMultiplier = isNaN(moneyFlowMultiplier) ? 1 : moneyFlowMultiplier;
        // Calculate Money Flow Volume
        const moneyFlowVolume = moneyFlowMultiplier * volume;
        // Add to cumulative ADL (don't round internal state, only output)
        this.cumulativeADL += moneyFlowVolume;
        return Math.round(this.cumulativeADL);
    }
    getResult() {
        return [Math.round(this.cumulativeADL)];
    }
}
ADL.calculate = adl;
