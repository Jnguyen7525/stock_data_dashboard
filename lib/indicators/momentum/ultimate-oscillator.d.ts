import { IndicatorInput, NumberOrUndefined } from '../types';
export interface UltimateOscillatorInput extends IndicatorInput {
    high: number[];
    low: number[];
    close: number[];
    period1?: number;
    period2?: number;
    period3?: number;
}
export declare function ultimateoscillator(input: UltimateOscillatorInput): number[];
export declare class UltimateOscillator {
    private period1;
    private period2;
    private period3;
    private highValues;
    private lowValues;
    private closeValues;
    private trueRanges;
    private buyingPressures;
    constructor(input: UltimateOscillatorInput);
    nextValue(high: number, low: number, close: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof ultimateoscillator;
}
