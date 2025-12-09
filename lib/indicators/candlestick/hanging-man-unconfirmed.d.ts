import { CandleData } from '../types';
export interface HangingManUnconfirmedInput {
    candles: CandleData[];
}
export declare function hangingmanunconfirmed(input: HangingManUnconfirmedInput): boolean[];
export declare class HangingManUnconfirmed {
    private candles;
    constructor(input?: HangingManUnconfirmedInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof hangingmanunconfirmed;
}
