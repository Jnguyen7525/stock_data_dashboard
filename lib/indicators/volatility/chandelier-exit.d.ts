import { IndicatorInput } from '../types';
export interface ChandelierExitInput extends IndicatorInput {
    high: number[];
    low: number[];
    close: number[];
    period?: number;
    multiplier?: number;
}
export interface ChandelierExitOutput {
    exitLong?: number;
    exitShort?: number;
}
export declare function chandelierexit(input: ChandelierExitInput): ChandelierExitOutput[];
export declare class ChandelierExit {
    private period;
    private multiplier;
    private highValues;
    private lowValues;
    private closeValues;
    constructor(input: ChandelierExitInput);
    nextValue(high: number, low: number, close: number): ChandelierExitOutput | undefined;
    getResult(): ChandelierExitOutput[];
    static calculate: typeof chandelierexit;
}
