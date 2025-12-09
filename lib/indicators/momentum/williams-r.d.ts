import { IndicatorInput, NumberOrUndefined } from '../types';
export interface WilliamsRInput extends IndicatorInput {
    period: number;
    high: number[];
    low: number[];
    close: number[];
}
export declare function williamsr(input: WilliamsRInput): number[];
export declare class WilliamsR {
    private period;
    private highValues;
    private lowValues;
    private closeValues;
    constructor(input: WilliamsRInput);
    nextValue(high: number, low: number, close: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof williamsr;
}
