import { CandleData } from '../types';
export interface BearishSpinningTopInput {
    candles: CandleData[];
}
export declare function bearishspinningtop(input: BearishSpinningTopInput): boolean[];
export declare class BearishSpinningTop {
    private candles;
    constructor(input?: BearishSpinningTopInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof bearishspinningtop;
}
