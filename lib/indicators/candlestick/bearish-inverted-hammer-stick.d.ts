import { CandleData } from '../types';
export interface BearishInvertedHammerStickInput {
    candles: CandleData[];
}
export declare function bearishinvertedhammerstick(input: BearishInvertedHammerStickInput): boolean[];
export declare class BearishInvertedHammerStick {
    private candles;
    constructor(input?: BearishInvertedHammerStickInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof bearishinvertedhammerstick;
}
