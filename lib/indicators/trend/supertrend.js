function trueRange(high, low, previousClose) {
    const highLow = high - low;
    const highPrevClose = Math.abs(high - previousClose);
    const lowPrevClose = Math.abs(low - previousClose);
    return Math.max(highLow, highPrevClose, lowPrevClose);
}
function calculateATR(high, low, close, period) {
    if (high.length !== low.length || low.length !== close.length || close.length < period + 1) {
        return [];
    }
    const result = [];
    const trueRanges = [];
    // Calculate true ranges (skip first value since we need previous close)
    for (let i = 1; i < close.length; i++) {
        const tr = trueRange(high[i], low[i], close[i - 1]);
        trueRanges.push(tr);
    }
    // Calculate initial ATR using simple average
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += trueRanges[i];
    }
    let currentATR = sum / period;
    result.push(currentATR);
    // Calculate subsequent ATR using Wilder's smoothing
    for (let i = period; i < trueRanges.length; i++) {
        currentATR = ((currentATR * (period - 1)) + trueRanges[i]) / period;
        result.push(currentATR);
    }
    return result;
}
export function supertrend(input) {
    const { period = 10, multiplier = 3, high, low, close } = input;
    if (high.length !== low.length || low.length !== close.length || close.length < period + 1) {
        return [];
    }
    const atrValues = calculateATR(high, low, close, period);
    const result = [];
    let previousFinalUpperBand;
    let previousFinalLowerBand;
    let previousDirection;
    for (let i = 0; i < atrValues.length; i++) {
        const idx = i + period; // Adjust index for ATR calculation offset
        const hl2 = (high[idx] + low[idx]) / 2; // Typical price
        const atr = atrValues[i];
        // Calculate basic upper and lower bands
        const basicUpperBand = hl2 + (multiplier * atr);
        const basicLowerBand = hl2 - (multiplier * atr);
        // Calculate final upper and lower bands
        let finalUpperBand;
        let finalLowerBand;
        if (i === 0) {
            finalUpperBand = basicUpperBand;
            finalLowerBand = basicLowerBand;
        }
        else {
            const prevClose = close[idx - 1];
            // Final Upper Band = Basic Upper Band < Final Upper Band[1] or Close[1] > Final Upper Band[1] ? Basic Upper Band : Final Upper Band[1]
            finalUpperBand = (basicUpperBand < previousFinalUpperBand || prevClose > previousFinalUpperBand) ?
                basicUpperBand : previousFinalUpperBand;
            // Final Lower Band = Basic Lower Band > Final Lower Band[1] or Close[1] < Final Lower Band[1] ? Basic Lower Band : Final Lower Band[1]
            finalLowerBand = (basicLowerBand > previousFinalLowerBand || prevClose < previousFinalLowerBand) ?
                basicLowerBand : previousFinalLowerBand;
        }
        // Determine trend direction and SuperTrend value
        let direction;
        let supertrendValue;
        if (i === 0) {
            // Initialize trend based on close vs bands
            if (close[idx] <= finalLowerBand) {
                direction = -1;
                supertrendValue = finalUpperBand;
            }
            else {
                direction = 1;
                supertrendValue = finalLowerBand;
            }
        }
        else {
            if (previousDirection === 1 && close[idx] <= finalLowerBand) {
                direction = -1;
                supertrendValue = finalUpperBand;
            }
            else if (previousDirection === -1 && close[idx] >= finalUpperBand) {
                direction = 1;
                supertrendValue = finalLowerBand;
            }
            else {
                direction = previousDirection;
                supertrendValue = direction === 1 ? finalLowerBand : finalUpperBand;
            }
        }
        // Store current values for next iteration
        previousFinalUpperBand = finalUpperBand;
        previousFinalLowerBand = finalLowerBand;
        previousDirection = direction;
        result.push({
            supertrend: supertrendValue,
            direction: direction
        });
    }
    return result;
}
export class SuperTrend {
    constructor(input) {
        this.highValues = [];
        this.lowValues = [];
        this.closeValues = [];
        this.trueRanges = [];
        this.initialized = false;
        this.period = input.period || 10;
        this.multiplier = input.multiplier || 3;
    }
    nextValue(high, low, close) {
        this.highValues.push(high);
        this.lowValues.push(low);
        this.closeValues.push(close);
        // Need at least 2 closes to calculate true range
        if (this.closeValues.length < 2) {
            return undefined;
        }
        // Calculate true range
        const previousClose = this.closeValues[this.closeValues.length - 2];
        const tr = trueRange(high, low, previousClose);
        this.trueRanges.push(tr);
        // Initialize ATR
        if (!this.initialized) {
            if (this.trueRanges.length === this.period) {
                // Calculate initial ATR using simple average
                const sum = this.trueRanges.reduce((acc, tr) => acc + tr, 0);
                this.currentATR = sum / this.period;
                this.initialized = true;
            }
            else {
                return undefined;
            }
        }
        else {
            // Calculate ATR using Wilder's smoothing
            this.currentATR = ((this.currentATR * (this.period - 1)) + tr) / this.period;
        }
        // Calculate SuperTrend
        const hl2 = (high + low) / 2;
        const basicUpperBand = hl2 + (this.multiplier * this.currentATR);
        const basicLowerBand = hl2 - (this.multiplier * this.currentATR);
        // Calculate final bands
        let finalUpperBand;
        let finalLowerBand;
        if (this.previousFinalUpperBand === undefined || this.previousFinalLowerBand === undefined) {
            finalUpperBand = basicUpperBand;
            finalLowerBand = basicLowerBand;
        }
        else {
            const prevClose = this.closeValues[this.closeValues.length - 2];
            finalUpperBand = (basicUpperBand < this.previousFinalUpperBand || prevClose > this.previousFinalUpperBand) ?
                basicUpperBand : this.previousFinalUpperBand;
            finalLowerBand = (basicLowerBand > this.previousFinalLowerBand || prevClose < this.previousFinalLowerBand) ?
                basicLowerBand : this.previousFinalLowerBand;
        }
        // Determine trend direction and SuperTrend value
        if (this.previousDirection === undefined) {
            // Initialize trend
            if (close <= finalLowerBand) {
                this.direction = -1;
                this.supertrendValue = finalUpperBand;
            }
            else {
                this.direction = 1;
                this.supertrendValue = finalLowerBand;
            }
        }
        else {
            if (this.previousDirection === 1 && close <= finalLowerBand) {
                this.direction = -1;
                this.supertrendValue = finalUpperBand;
            }
            else if (this.previousDirection === -1 && close >= finalUpperBand) {
                this.direction = 1;
                this.supertrendValue = finalLowerBand;
            }
            else {
                this.direction = this.previousDirection;
                this.supertrendValue = this.direction === 1 ? finalLowerBand : finalUpperBand;
            }
        }
        // Store for next iteration
        this.previousFinalUpperBand = finalUpperBand;
        this.previousFinalLowerBand = finalLowerBand;
        this.previousDirection = this.direction;
        return {
            supertrend: this.supertrendValue,
            direction: this.direction
        };
    }
    getResult() {
        if (this.supertrendValue === undefined || this.direction === undefined) {
            return [];
        }
        return [{
                supertrend: this.supertrendValue,
                direction: this.direction
            }];
    }
}
SuperTrend.calculate = supertrend;
