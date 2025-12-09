import { CandleData } from '../types';
export interface BullishInvertedHammerStickInput {
    candles: CandleData[];
}
export declare function bullishinvertedhammerstick(input: BullishInvertedHammerStickInput): boolean[];
export declare class BullishInvertedHammerStick {
    private candles;
    constructor(input?: BullishInvertedHammerStickInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof bullishinvertedhammerstick;
}
