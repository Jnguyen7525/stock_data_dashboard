import { IndicatorInput, NumberOrUndefined } from '../types';
export interface SMAInput extends IndicatorInput {
    period: number;
    values: number[];
}
export declare function sma(input: SMAInput): number[];
export declare class SMA {
    private period;
    private values;
    private sum;
    constructor(input: SMAInput);
    nextValue(value: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof sma;
}
