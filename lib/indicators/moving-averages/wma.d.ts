import { IndicatorInput, NumberOrUndefined } from '../types';
export interface WMAInput extends IndicatorInput {
    period: number;
    values: number[];
}
export declare function wma(input: WMAInput): number[];
export declare class WMA {
    private period;
    private values;
    constructor(input: WMAInput);
    nextValue(value: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof wma;
}
