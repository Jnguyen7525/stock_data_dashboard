function calculateStandardDeviation(values, mean) {
    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDifferences.reduce((sum, sqDiff) => sum + sqDiff, 0) / values.length;
    return Math.sqrt(variance);
}
export function volatilityindex(input) {
    const { period = 30, values } = input;
    if (values.length < period + 1) {
        return [];
    }
    const result = [];
    for (let i = period; i < values.length; i++) {
        // Calculate returns for the period
        const returns = [];
        for (let j = i - period + 1; j <= i; j++) {
            const returnValue = (values[j] - values[j - 1]) / values[j - 1];
            returns.push(returnValue);
        }
        // Calculate mean return
        const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
        // Calculate standard deviation of returns
        const stdDev = calculateStandardDeviation(returns, meanReturn);
        // Annualized volatility (assuming daily data, multiply by sqrt(252))
        // For general use, we'll use sqrt(period) as a scaling factor
        const volatility = stdDev * Math.sqrt(period) * 100; // Convert to percentage
        result.push(volatility);
    }
    return result;
}
export class VolatilityIndex {
    constructor(input) {
        this.values = [];
        this.period = input.period || 30;
    }
    nextValue(value) {
        this.values.push(value);
        // Need at least period + 1 values to calculate returns and volatility
        if (this.values.length < this.period + 1) {
            return undefined;
        }
        // Keep only necessary values for efficiency
        if (this.values.length > this.period + 1) {
            this.values.shift();
        }
        // Calculate returns for the period
        const returns = [];
        for (let i = 1; i < this.values.length; i++) {
            const returnValue = (this.values[i] - this.values[i - 1]) / this.values[i - 1];
            returns.push(returnValue);
        }
        // Calculate mean return
        const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
        // Calculate standard deviation of returns
        const stdDev = calculateStandardDeviation(returns, meanReturn);
        // Annualized volatility (using sqrt(period) as scaling factor)
        const volatility = stdDev * Math.sqrt(this.period) * 100; // Convert to percentage
        return volatility;
    }
    getResult() {
        if (this.values.length < this.period + 1) {
            return [];
        }
        const lastResult = this.nextValue(this.values[this.values.length - 1]);
        return lastResult !== undefined ? [lastResult] : [];
    }
}
VolatilityIndex.calculate = volatilityindex;
