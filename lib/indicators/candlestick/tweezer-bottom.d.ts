import { CandleData } from '../types';
export interface TweezerBottomInput {
    candles: CandleData[];
}
export declare function tweezerbottom(input: TweezerBottomInput): boolean[];
export declare class TweezerBottom {
    private candles;
    constructor(input?: TweezerBottomInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof tweezerbottom;
}
