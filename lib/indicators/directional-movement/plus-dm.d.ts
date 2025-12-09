import { IndicatorInput } from '../types';
export interface PlusDMInput extends IndicatorInput {
    high: number[];
    low: number[];
    period?: number;
}
export declare function plusdm(input: PlusDMInput): number[];
export declare class PlusDM {
    private period;
    private highValues;
    private lowValues;
    constructor(input: PlusDMInput);
    nextValue(high: number, low: number): number | undefined;
    getResult(): number[];
    static calculate: typeof plusdm;
}
