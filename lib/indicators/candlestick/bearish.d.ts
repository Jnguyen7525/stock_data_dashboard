import { CandleData } from '../types';
export interface BearishInput {
    candles: CandleData[];
}
export declare function bearish(input: BearishInput): boolean[];
export declare class Bearish {
    private candles;
    constructor(input?: BearishInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof bearish;
}
