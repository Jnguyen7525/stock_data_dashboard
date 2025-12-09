import { IndicatorInput, NumberOrUndefined } from '../types';
export interface EMAInput extends IndicatorInput {
    period: number;
    values: number[];
}
export declare function ema(input: EMAInput): number[];
export declare class EMA {
    private period;
    private multiplier;
    private previousEMA;
    private values;
    private initialized;
    constructor(input: EMAInput);
    nextValue(value: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof ema;
}
