import { IndicatorInput, NumberOrUndefined } from '../types';
export interface TrueRangeInput extends IndicatorInput {
    high: number[];
    low: number[];
    close: number[];
}
export declare function truerange(input: TrueRangeInput): number[];
export declare class TrueRange {
    private highValues;
    private lowValues;
    private closeValues;
    constructor(input?: TrueRangeInput);
    nextValue(high: number, low: number, close: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof truerange;
}
