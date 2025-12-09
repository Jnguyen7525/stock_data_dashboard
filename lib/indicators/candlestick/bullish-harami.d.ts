import { CandleData } from '../types';
export interface BullishHaramiInput {
    candles: CandleData[];
}
export declare function bullishharami(input: BullishHaramiInput): boolean[];
export declare class BullishHarami {
    private candles;
    constructor(input?: BullishHaramiInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof bullishharami;
}
