import { IndicatorInput, NumberOrUndefined } from '../types';
export interface VolatilityIndexInput extends IndicatorInput {
    period: number;
    values: number[];
}
export declare function volatilityindex(input: VolatilityIndexInput): number[];
export declare class VolatilityIndex {
    private period;
    private values;
    constructor(input: VolatilityIndexInput);
    nextValue(value: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof volatilityindex;
}
