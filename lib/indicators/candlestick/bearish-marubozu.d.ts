import { CandleData } from '../types';
export interface BearishMarubozuInput {
    candles: CandleData[];
}
export declare function bearishmarubozu(input: BearishMarubozuInput): boolean[];
export declare class BearishMarubozu {
    private candles;
    constructor(input?: BearishMarubozuInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof bearishmarubozu;
}
