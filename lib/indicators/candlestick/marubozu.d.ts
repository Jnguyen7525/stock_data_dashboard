import { CandleData } from '../types';
export interface MarubozuInput {
    candles: CandleData[];
}
export declare function marubozu(input: MarubozuInput): boolean[];
export declare class MarubozuPattern {
    private candles;
    constructor(input?: MarubozuInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof marubozu;
}
