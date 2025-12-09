import { CandleData } from '../types';
export interface BullishMarubozuInput {
    candles: CandleData[];
}
export declare function bullishmarubozu(input: BullishMarubozuInput): boolean[];
export declare class BullishMarubozu {
    private candles;
    constructor(input?: BullishMarubozuInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof bullishmarubozu;
}
