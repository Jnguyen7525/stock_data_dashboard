import { IndicatorInput, NumberOrUndefined } from '../types';
export interface ROCInput extends IndicatorInput {
    period: number;
    values: number[];
}
export declare function roc(input: ROCInput): number[];
export declare class ROC {
    private period;
    private values;
    constructor(input: ROCInput);
    nextValue(value: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof roc;
}
