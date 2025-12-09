import { IndicatorInput, NumberOrUndefined } from '../types';
export interface PSARInput extends IndicatorInput {
    high: number[];
    low: number[];
    step?: number;
    max?: number;
}
export declare function psar(input: PSARInput): number[];
export declare class PSAR {
    private step;
    private max;
    private curr;
    private extreme;
    private sar;
    private furthest;
    private up;
    private accel;
    private prev;
    private results;
    constructor(input: PSARInput);
    nextValue(high: number, low: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof psar;
}
