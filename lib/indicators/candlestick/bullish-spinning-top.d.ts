import { CandleData } from '../types';
export interface BullishSpinningTopInput {
    candles: CandleData[];
}
export declare function bullishspinningtop(input: BullishSpinningTopInput): boolean[];
export declare class BullishSpinningTop {
    private candles;
    constructor(input?: BullishSpinningTopInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof bullishspinningtop;
}
