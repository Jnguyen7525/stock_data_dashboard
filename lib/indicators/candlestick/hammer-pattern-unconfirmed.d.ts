import { CandleData } from '../types';
export interface HammerPatternUnconfirmedInput {
    candles: CandleData[];
}
export declare function hammerpatternunconfirmed(input: HammerPatternUnconfirmedInput): boolean[];
export declare class HammerPatternUnconfirmed {
    private candles;
    constructor(input?: HammerPatternUnconfirmedInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof hammerpatternunconfirmed;
}
