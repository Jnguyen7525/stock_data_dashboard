import { CandleData } from '../types';
export interface BullishHammerStickInput {
    candles: CandleData[];
}
export declare function bullishhammerstick(input: BullishHammerStickInput): boolean[];
export declare class BullishHammerStick {
    private candles;
    constructor(input?: BullishHammerStickInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof bullishhammerstick;
}
