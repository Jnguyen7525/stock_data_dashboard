export function vwap(input) {
    const { high, low, close, volume } = input;
    if (high.length !== low.length || low.length !== close.length || close.length !== volume.length) {
        return [];
    }
    const result = [];
    let cumulativePV = 0;
    let cumulativeVolume = 0;
    for (let i = 0; i < close.length; i++) {
        const typicalPrice = (high[i] + low[i] + close[i]) / 3;
        const pv = typicalPrice * volume[i];
        cumulativePV += pv;
        cumulativeVolume += volume[i];
        const vwapValue = cumulativeVolume === 0 ? 0 : cumulativePV / cumulativeVolume;
        result.push(vwapValue);
    }
    return result;
}
export class VWAP {
    constructor(input) {
        this.cumulativePV = 0;
        this.cumulativeVolume = 0;
        if (input?.high?.length) {
            const { high, low, close, volume } = input;
            for (let i = 0; i < Math.min(high.length, low.length, close.length, volume.length); i++) {
                this.nextValue(high[i], low[i], close[i], volume[i]);
            }
        }
    }
    nextValue(high, low, close, volume) {
        const typicalPrice = (high + low + close) / 3;
        const pv = typicalPrice * volume;
        this.cumulativePV += pv;
        this.cumulativeVolume += volume;
        return this.cumulativeVolume === 0 ? 0 : this.cumulativePV / this.cumulativeVolume;
    }
    getResult() {
        return [this.cumulativeVolume === 0 ? 0 : this.cumulativePV / this.cumulativeVolume];
    }
}
VWAP.calculate = vwap;
