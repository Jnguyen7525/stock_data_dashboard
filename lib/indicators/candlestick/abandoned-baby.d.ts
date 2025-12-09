import { CandleData } from '../types';
export interface AbandonedBabyInput {
    candles: CandleData[];
}
export declare function abandonedbaby(input: AbandonedBabyInput): boolean[];
export declare class AbandonedBaby {
    private candles;
    constructor(input?: AbandonedBabyInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof abandonedbaby;
}
