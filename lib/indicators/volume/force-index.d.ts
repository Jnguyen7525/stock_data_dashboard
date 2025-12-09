import { IndicatorInput, NumberOrUndefined } from '../types';
export interface ForceIndexInput extends IndicatorInput {
    period: number;
    close: number[];
    volume: number[];
}
export declare function forceindex(input: ForceIndexInput): number[];
export declare class ForceIndex {
    private period;
    private closeValues;
    private volumeValues;
    private emaCalculator;
    private initialized;
    constructor(input: ForceIndexInput);
    nextValue(close: number, volume: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof forceindex;
}
