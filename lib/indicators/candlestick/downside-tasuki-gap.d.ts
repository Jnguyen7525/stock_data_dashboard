import { CandleData } from '../types';
export interface DownsideTasukiGapInput {
    candles: CandleData[];
}
export declare function downsidetasukigap(input: DownsideTasukiGapInput): boolean[];
export declare class DownsideTasukiGap {
    private candles;
    constructor(input?: DownsideTasukiGapInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof downsidetasukigap;
}
