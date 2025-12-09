import { IndicatorInput, NumberOrUndefined } from '../types';
export interface WilderSmoothingInput extends IndicatorInput {
    values: number[];
    period: number;
}
export declare function wildersmoothing(input: WilderSmoothingInput): number[];
export declare class WilderSmoothing {
    private period;
    private values;
    private smoothedValue;
    private initialized;
    constructor(input: WilderSmoothingInput);
    nextValue(value: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof wildersmoothing;
}
