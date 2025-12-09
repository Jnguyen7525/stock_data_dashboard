import { CandleData } from '../types';
export interface HeikinAshiInput {
    candles: CandleData[];
}
export interface HeikinAshiOutput {
    open: number;
    high: number;
    low: number;
    close: number;
}
export declare function heikinashi(input: HeikinAshiInput): HeikinAshiOutput[];
export declare class HeikinAshi {
    private candles;
    private previousHA;
    constructor(input?: HeikinAshiInput);
    nextValue(candle: CandleData): HeikinAshiOutput;
    getResult(): HeikinAshiOutput[];
    static calculate: typeof heikinashi;
}
