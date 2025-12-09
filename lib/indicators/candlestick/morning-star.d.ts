import { CandleData } from '../types';
export interface MorningStarInput {
    candles: CandleData[];
}
export declare function morningstar(input: MorningStarInput): boolean[];
export declare class MorningStar {
    private candles;
    constructor(input?: MorningStarInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof morningstar;
}
