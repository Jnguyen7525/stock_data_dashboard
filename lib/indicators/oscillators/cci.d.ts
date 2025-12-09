import { IndicatorInput, NumberOrUndefined } from '../types';
export interface CCIInput extends IndicatorInput {
    period: number;
    high: number[];
    low: number[];
    close: number[];
}
export declare function cci(input: CCIInput): number[];
export declare class CCI {
    private period;
    private highValues;
    private lowValues;
    private closeValues;
    constructor(input: CCIInput);
    nextValue(high: number, low: number, close: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof cci;
}
