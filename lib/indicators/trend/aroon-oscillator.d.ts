import { IndicatorInput, NumberOrUndefined } from '../types';
export interface AroonOscillatorInput extends IndicatorInput {
    period: number;
    high: number[];
    low: number[];
}
export declare function aroonoscillator(input: AroonOscillatorInput): number[];
export declare class AroonOscillator {
    private period;
    private highValues;
    private lowValues;
    constructor(input: AroonOscillatorInput);
    nextValue(high: number, low: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof aroonoscillator;
}
