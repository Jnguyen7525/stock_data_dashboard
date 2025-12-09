import { IndicatorInput } from '../types';
export interface MinusDMInput extends IndicatorInput {
    high: number[];
    low: number[];
    period?: number;
}
export declare function minusdm(input: MinusDMInput): number[];
export declare class MinusDM {
    private period;
    private highValues;
    private lowValues;
    constructor(input: MinusDMInput);
    nextValue(high: number, low: number): number | undefined;
    getResult(): number[];
    static calculate: typeof minusdm;
}
