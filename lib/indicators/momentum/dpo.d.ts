import { IndicatorInput, NumberOrUndefined } from '../types';
export interface DPOInput extends IndicatorInput {
    period: number;
    values: number[];
}
export declare function dpo(input: DPOInput): number[];
export declare class DPO {
    private period;
    private values;
    private lookback;
    constructor(input: DPOInput);
    nextValue(value: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof dpo;
}
