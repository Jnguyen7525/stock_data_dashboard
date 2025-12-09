import { CandleData } from '../types';
export interface BearishInvertedHammerInput {
    candles: CandleData[];
}
export declare function bearishinvertedhammer(input: BearishInvertedHammerInput): boolean[];
export declare class BearishInvertedHammer {
    private candles;
    constructor(input?: BearishInvertedHammerInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof bearishinvertedhammer;
}
