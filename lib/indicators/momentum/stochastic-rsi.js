import { rsi } from '../oscillators/rsi';
import { sma } from '../moving-averages/sma';
export function stochasticrsi(input) {
    const { rsiPeriod = 14, stochasticPeriod = 14, kPeriod = 3, dPeriod = 3, values } = input;
    // Need enough data for full calculation
    const requiredLength = rsiPeriod + stochasticPeriod + kPeriod + dPeriod - 1;
    if (values.length < requiredLength) {
        return [];
    }
    // Calculate RSI first
    const rsiValues = rsi({ period: rsiPeriod, values });
    if (rsiValues.length < stochasticPeriod) {
        return [];
    }
    const result = [];
    const stochRSIValues = [];
    // Calculate Stochastic RSI
    for (let i = stochasticPeriod - 1; i < rsiValues.length; i++) {
        const rsiSlice = rsiValues.slice(i - stochasticPeriod + 1, i + 1);
        const highestRSI = Math.max(...rsiSlice);
        const lowestRSI = Math.min(...rsiSlice);
        let stochRSI;
        if (highestRSI === lowestRSI) {
            stochRSI = 0; // Avoid division by zero
        }
        else {
            stochRSI = ((rsiValues[i] - lowestRSI) / (highestRSI - lowestRSI)) * 100;
        }
        stochRSIValues.push(stochRSI);
    }
    // Calculate %K (SMA of Stochastic RSI)
    const kValues = sma({ period: kPeriod, values: stochRSIValues });
    // Calculate %D (SMA of %K)
    const dValues = sma({ period: dPeriod, values: kValues });
    // Only return results when we have complete D values
    // This means we start from kPeriod + dPeriod - 2 index in stochRSI
    const startIndex = kPeriod + dPeriod - 2;
    for (let i = startIndex; i < stochRSIValues.length; i++) {
        const kIndex = i - kPeriod + 1;
        const dIndex = i - kPeriod - dPeriod + 2;
        result.push({
            stochRSI: stochRSIValues[i],
            k: kValues[kIndex],
            d: dValues[dIndex]
        });
    }
    return result;
}
export class StochasticRSI {
    constructor(input) {
        this.values = [];
        this.rsiValues = [];
        this.stochRSIValues = [];
        this.rsiPeriod = input.rsiPeriod || 14;
        this.stochasticPeriod = input.stochasticPeriod || 14;
        this.kPeriod = input.kPeriod || 3;
        this.dPeriod = input.dPeriod || 3;
        // Create inline RSI calculator
        this.rsiCalculator = this.createRSICalculator(this.rsiPeriod);
        // Create SMA calculators for K and D
        this.kCalculator = this.createSMACalculator(this.kPeriod);
        this.dCalculator = this.createSMACalculator(this.dPeriod);
        if (input.values?.length) {
            input.values.forEach(value => this.nextValue(value));
        }
    }
    createRSICalculator(period) {
        return {
            values: [],
            gains: [],
            losses: [],
            avgGain: 0,
            avgLoss: 0,
            initialized: false,
            period,
            nextValue: function (value) {
                this.values.push(value);
                if (this.values.length === 1)
                    return undefined;
                const diff = value - this.values[this.values.length - 2];
                const gain = diff > 0 ? diff : 0;
                const loss = diff < 0 ? Math.abs(diff) : 0;
                this.gains.push(gain);
                this.losses.push(loss);
                if (!this.initialized) {
                    if (this.gains.length === this.period) {
                        this.avgGain = this.gains.reduce((sum, g) => sum + g, 0) / this.period;
                        this.avgLoss = this.losses.reduce((sum, l) => sum + l, 0) / this.period;
                        this.initialized = true;
                        const rs = this.avgLoss === 0 ? 100 : this.avgGain / this.avgLoss;
                        return parseFloat((100 - (100 / (1 + rs))).toFixed(2));
                    }
                    return undefined;
                }
                this.avgGain = ((this.avgGain * (this.period - 1)) + gain) / this.period;
                this.avgLoss = ((this.avgLoss * (this.period - 1)) + loss) / this.period;
                const rs = this.avgLoss === 0 ? 100 : this.avgGain / this.avgLoss;
                return parseFloat((100 - (100 / (1 + rs))).toFixed(2));
            }
        };
    }
    createSMACalculator(period) {
        return {
            values: [],
            period,
            nextValue: function (value) {
                this.values.push(value);
                if (this.values.length > this.period) {
                    this.values.shift();
                }
                if (this.values.length === this.period) {
                    return this.values.reduce((sum, val) => sum + val, 0) / this.period;
                }
                return undefined;
            }
        };
    }
    nextValue(value) {
        this.values.push(value);
        // Calculate RSI
        const rsiValue = this.rsiCalculator.nextValue(value);
        if (rsiValue === undefined)
            return undefined;
        this.rsiValues.push(rsiValue);
        // Keep only required RSI values
        if (this.rsiValues.length > this.stochasticPeriod) {
            this.rsiValues.shift();
        }
        if (this.rsiValues.length < this.stochasticPeriod) {
            return undefined;
        }
        // Calculate Stochastic RSI
        const highestRSI = Math.max(...this.rsiValues);
        const lowestRSI = Math.min(...this.rsiValues);
        let stochRSI;
        if (highestRSI === lowestRSI) {
            stochRSI = 0;
        }
        else {
            stochRSI = ((rsiValue - lowestRSI) / (highestRSI - lowestRSI)) * 100;
        }
        this.stochRSIValues.push(stochRSI);
        // Calculate %K and %D
        const kValue = this.kCalculator.nextValue(stochRSI);
        const dValue = kValue !== undefined ? this.dCalculator.nextValue(kValue) : undefined;
        // Only return when we have complete %D values (same logic as functional version)
        if (dValue === undefined) {
            return undefined;
        }
        return {
            stochRSI: stochRSI,
            k: kValue,
            d: dValue
        };
    }
    getResult() {
        if (this.stochRSIValues.length === 0) {
            return [];
        }
        const lastStochRSI = this.stochRSIValues[this.stochRSIValues.length - 1];
        const kResult = this.kCalculator.values.length === this.kPeriod
            ? this.kCalculator.values.reduce((sum, val) => sum + val, 0) / this.kPeriod
            : undefined;
        const dResult = this.dCalculator.values.length === this.dPeriod
            ? this.dCalculator.values.reduce((sum, val) => sum + val, 0) / this.dPeriod
            : undefined;
        return [{
                stochRSI: lastStochRSI,
                k: kResult,
                d: dResult
            }];
    }
}
StochasticRSI.calculate = stochasticrsi;
