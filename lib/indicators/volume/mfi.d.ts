import { IndicatorInput, NumberOrUndefined } from '../types';
export interface MFIInput extends IndicatorInput {
    period: number;
    high: number[];
    low: number[];
    close: number[];
    volume: number[];
}
export declare function mfi(input: MFIInput): number[];
export declare class MFI {
    private period;
    private positiveFlows;
    private negativeFlows;
    private prevTypicalPrice;
    private results;
    private totalPushed;
    constructor(input: MFIInput);
    nextValue(high: number, low: number, close: number, volume: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof mfi;
}
