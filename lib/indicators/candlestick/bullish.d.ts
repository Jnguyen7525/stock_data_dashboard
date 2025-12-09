import { CandleData } from '../types';
export interface BullishInput {
    candles: CandleData[];
}
export declare function bullish(input: BullishInput): boolean[];
export declare class Bullish {
    private candles;
    constructor(input?: BullishInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof bullish;
}
