import { CandleData } from '../types';
export interface SpinningTopInput {
    candles: CandleData[];
}
export declare function spinningtop(input: SpinningTopInput): boolean[];
export declare class SpinningTopPattern {
    private candles;
    constructor(input?: SpinningTopInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof spinningtop;
}
