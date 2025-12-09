import { CandleData } from '../types';
export interface TweezerTopInput {
    candles: CandleData[];
}
export declare function tweezertop(input: TweezerTopInput): boolean[];
export declare class TweezerTop {
    private candles;
    constructor(input?: TweezerTopInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof tweezertop;
}
