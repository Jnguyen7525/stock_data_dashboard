import { StochasticInput, StochasticOutput } from '../types';
export declare function stochastic(input: StochasticInput): StochasticOutput[];
export declare class Stochastic {
    private period;
    private signalPeriod;
    private highValues;
    private lowValues;
    private closeValues;
    private kValues;
    private dCalculator;
    constructor(input: StochasticInput);
    nextValue(high: number, low: number, close: number): StochasticOutput | undefined;
    getResult(): StochasticOutput[];
    static calculate: typeof stochastic;
}
