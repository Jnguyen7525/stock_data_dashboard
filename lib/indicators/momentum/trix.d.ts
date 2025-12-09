import { IndicatorInput, NumberOrUndefined } from '../types';
export interface TRIXInput extends IndicatorInput {
    period: number;
    values: number[];
}
export declare function trix(input: TRIXInput): number[];
export declare class TRIX {
    private period;
    private ema1Calculator;
    private ema2Calculator;
    private ema3Calculator;
    private previousTripleEMA;
    private initialized;
    constructor(input: TRIXInput);
    private createEMACalculator;
    nextValue(value: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof trix;
}
