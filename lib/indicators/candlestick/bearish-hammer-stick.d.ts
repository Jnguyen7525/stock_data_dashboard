import { CandleData } from '../types';
export interface BearishHammerStickInput {
    candles: CandleData[];
}
export declare function bearishhammerstick(input: BearishHammerStickInput): boolean[];
export declare class BearishHammerStick {
    private candles;
    constructor(input?: BearishHammerStickInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof bearishhammerstick;
}
