import { IndicatorInput } from '../types';
export interface StochasticRSIInput extends IndicatorInput {
    rsiPeriod: number;
    stochasticPeriod: number;
    kPeriod: number;
    dPeriod: number;
    values: number[];
}
export interface StochasticRSIOutput {
    stochRSI?: number;
    k?: number;
    d?: number;
}
export declare function stochasticrsi(input: StochasticRSIInput): StochasticRSIOutput[];
export declare class StochasticRSI {
    private rsiPeriod;
    private stochasticPeriod;
    private kPeriod;
    private dPeriod;
    private values;
    private rsiCalculator;
    private rsiValues;
    private stochRSIValues;
    private kCalculator;
    private dCalculator;
    constructor(input: StochasticRSIInput);
    private createRSICalculator;
    private createSMACalculator;
    nextValue(value: number): StochasticRSIOutput | undefined;
    getResult(): StochasticRSIOutput[];
    static calculate: typeof stochasticrsi;
}
