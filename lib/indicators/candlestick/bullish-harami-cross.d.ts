import { CandleData } from '../types';
export interface BullishHaramiCrossInput {
    candles: CandleData[];
}
export declare function bullishharamicross(input: BullishHaramiCrossInput): boolean[];
export declare class BullishHaramiCross {
    private candles;
    constructor(input?: BullishHaramiCrossInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof bullishharamicross;
}
