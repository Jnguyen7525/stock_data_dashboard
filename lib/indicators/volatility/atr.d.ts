import { IndicatorInput, NumberOrUndefined } from '../types';
export interface ATRInput extends IndicatorInput {
    period: number;
    high: number[];
    low: number[];
    close: number[];
}
export declare function atr(input: ATRInput): number[];
export declare class ATR {
    private period;
    private highValues;
    private lowValues;
    private closeValues;
    private trueRanges;
    private currentATR;
    private initialized;
    constructor(input: ATRInput);
    nextValue(high: number, low: number, close: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof atr;
}
