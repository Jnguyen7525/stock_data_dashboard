import { IndicatorInput } from '../types';
export interface AroonInput extends IndicatorInput {
    period: number;
    high: number[];
    low: number[];
}
export interface AroonOutput {
    aroonUp?: number;
    aroonDown?: number;
    aroonOscillator?: number;
}
export declare function aroon(input: AroonInput): AroonOutput[];
export declare class Aroon {
    private period;
    private highValues;
    private lowValues;
    constructor(input: AroonInput);
    nextValue(high: number, low: number): AroonOutput | undefined;
    getResult(): AroonOutput[];
    static calculate: typeof aroon;
}
