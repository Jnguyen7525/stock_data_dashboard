function calculatePivotPoints(high, low, close, type) {
    const pivot = (high + low + close) / 3;
    let r1, r2, r3, r4;
    let s1, s2, s3, s4;
    switch (type) {
        case 'fibonacci':
            r1 = pivot + 0.382 * (high - low);
            r2 = pivot + 0.618 * (high - low);
            r3 = pivot + 1.000 * (high - low);
            s1 = pivot - 0.382 * (high - low);
            s2 = pivot - 0.618 * (high - low);
            s3 = pivot - 1.000 * (high - low);
            break;
        case 'camarilla':
            r1 = close + (high - low) * 1.1 / 12;
            r2 = close + (high - low) * 1.1 / 6;
            r3 = close + (high - low) * 1.1 / 4;
            r4 = close + (high - low) * 1.1 / 2;
            s1 = close - (high - low) * 1.1 / 12;
            s2 = close - (high - low) * 1.1 / 6;
            s3 = close - (high - low) * 1.1 / 4;
            s4 = close - (high - low) * 1.1 / 2;
            break;
        case 'woodie':
            const woodiePivot = (high + low + 2 * close) / 4;
            r1 = 2 * woodiePivot - low;
            r2 = woodiePivot + (high - low);
            r3 = high + 2 * (woodiePivot - low);
            s1 = 2 * woodiePivot - high;
            s2 = woodiePivot - (high - low);
            s3 = low - 2 * (high - woodiePivot);
            return {
                pivot: woodiePivot,
                r1, r2, r3,
                s1, s2, s3
            };
        default: // standard
            r1 = 2 * pivot - low;
            r2 = pivot + (high - low);
            r3 = high + 2 * (pivot - low);
            s1 = 2 * pivot - high;
            s2 = pivot - (high - low);
            s3 = low - 2 * (high - pivot);
            break;
    }
    return {
        pivot,
        r1, r2, r3, r4,
        s1, s2, s3, s4
    };
}
export function pivotpoints(input) {
    const { high, low, close, type = 'standard' } = input;
    if (high.length !== low.length || low.length !== close.length || high.length === 0) {
        return [];
    }
    const result = [];
    // First period has no previous data, so return empty pivot
    result.push({});
    // Calculate pivot points using previous period's data
    for (let i = 1; i < high.length; i++) {
        const pivots = calculatePivotPoints(high[i - 1], low[i - 1], close[i - 1], type);
        result.push(pivots);
    }
    return result;
}
export class PivotPoints {
    constructor(input) {
        this.results = [];
        this.type = input.type || 'standard';
    }
    nextValue(high, low, close) {
        let result;
        if (this.previousHigh !== undefined && this.previousLow !== undefined && this.previousClose !== undefined) {
            result = calculatePivotPoints(this.previousHigh, this.previousLow, this.previousClose, this.type);
            this.results.push(result);
        }
        else {
            // First value, no previous data available
            result = {};
            this.results.push(result);
        }
        // Store current values for next calculation
        this.previousHigh = high;
        this.previousLow = low;
        this.previousClose = close;
        return result;
    }
    getResult() {
        return this.results;
    }
}
PivotPoints.calculate = pivotpoints;
