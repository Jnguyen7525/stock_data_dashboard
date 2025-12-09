import { CandleData } from '../types';
export interface HammerInput {
    candles: CandleData[];
}
export declare function hammer(input: HammerInput): boolean[];
export declare class HammerPattern {
    private candles;
    constructor(input?: HammerInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof hammer;
}
