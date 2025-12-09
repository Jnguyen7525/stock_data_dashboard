import { CandleData } from '../types';
export interface HangingManInput {
    candles: CandleData[];
}
export declare function hangingman(input: HangingManInput): boolean[];
export declare class HangingManPattern {
    private candles;
    constructor(input?: HangingManInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof hangingman;
}
