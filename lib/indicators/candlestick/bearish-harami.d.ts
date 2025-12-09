import { CandleData } from '../types';
export interface BearishHaramiInput {
    candles: CandleData[];
}
export declare function bearishharami(input: BearishHaramiInput): boolean[];
export declare class BearishHarami {
    private candles;
    constructor(input?: BearishHaramiInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof bearishharami;
}
