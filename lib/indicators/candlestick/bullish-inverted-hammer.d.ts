import { CandleData } from '../types';
export interface BullishInvertedHammerInput {
    candles: CandleData[];
}
export declare function bullishinvertedhammer(input: BullishInvertedHammerInput): boolean[];
export declare class BullishInvertedHammer {
    private candles;
    constructor(input?: BullishInvertedHammerInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof bullishinvertedhammer;
}
