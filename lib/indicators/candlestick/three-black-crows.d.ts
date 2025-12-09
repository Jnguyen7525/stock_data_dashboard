import { CandleData } from '../types';
export interface ThreeBlackCrowsInput {
    candles: CandleData[];
}
export declare function threeblackcrows(input: ThreeBlackCrowsInput): boolean[];
export declare class ThreeBlackCrowsPattern {
    private candles;
    constructor(input?: ThreeBlackCrowsInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof threeblackcrows;
}
