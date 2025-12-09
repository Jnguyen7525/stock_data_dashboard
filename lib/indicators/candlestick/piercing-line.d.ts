import { CandleData } from '../types';
export interface PiercingLineInput {
    candles: CandleData[];
}
export declare function piercingline(input: PiercingLineInput): boolean[];
export declare class PiercingLine {
    private candles;
    constructor(input?: PiercingLineInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof piercingline;
}
