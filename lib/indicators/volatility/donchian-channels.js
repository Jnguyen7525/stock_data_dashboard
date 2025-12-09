export function donchianchannels(input) {
    const { period = 20, high, low } = input;
    if (high.length !== low.length || high.length < period) {
        return [];
    }
    const result = [];
    for (let i = period - 1; i < high.length; i++) {
        // Get the subset of data for this period
        const highSubset = high.slice(i - period + 1, i + 1);
        const lowSubset = low.slice(i - period + 1, i + 1);
        // Find highest high and lowest low in the period
        const upperChannel = Math.max(...highSubset);
        const lowerChannel = Math.min(...lowSubset);
        const middleChannel = (upperChannel + lowerChannel) / 2;
        const channelWidth = upperChannel - lowerChannel;
        result.push({
            upper: upperChannel,
            middle: middleChannel,
            lower: lowerChannel,
            width: channelWidth
        });
    }
    return result;
}
export class DonchianChannels {
    constructor(input) {
        this.highValues = [];
        this.lowValues = [];
        this.period = input.period || 20;
    }
    nextValue(high, low) {
        this.highValues.push(high);
        this.lowValues.push(low);
        // Need at least period values to calculate
        if (this.highValues.length < this.period) {
            return undefined;
        }
        // Keep only the last 'period' values for efficiency
        if (this.highValues.length > this.period) {
            this.highValues.shift();
            this.lowValues.shift();
        }
        // Find highest high and lowest low in the period
        const upperChannel = Math.max(...this.highValues);
        const lowerChannel = Math.min(...this.lowValues);
        const middleChannel = (upperChannel + lowerChannel) / 2;
        const channelWidth = upperChannel - lowerChannel;
        return {
            upper: upperChannel,
            middle: middleChannel,
            lower: lowerChannel,
            width: channelWidth
        };
    }
    getResult() {
        if (this.highValues.length < this.period) {
            return [];
        }
        const lastResult = this.nextValue(this.highValues[this.highValues.length - 1], this.lowValues[this.lowValues.length - 1]);
        return lastResult ? [lastResult] : [];
    }
}
DonchianChannels.calculate = donchianchannels;
