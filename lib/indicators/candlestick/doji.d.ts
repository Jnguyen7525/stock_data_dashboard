import { CandleData } from '../types';
export interface DojiInput {
    candles: CandleData[];
}
export declare function doji(input: DojiInput): boolean[];
export declare class DojiPattern {
    private candles;
    constructor(input?: DojiInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof doji;
}
