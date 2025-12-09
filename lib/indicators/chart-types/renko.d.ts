import { CandleData } from '../types';
export interface RenkoInput {
    candles: CandleData[];
    brickSize: number;
}
export interface RenkoOutput {
    open: number;
    close: number;
    high: number;
    low: number;
    trend: 1 | -1;
}
export declare function renko(input: RenkoInput): RenkoOutput[];
export declare class Renko {
    private brickSize;
    private candles;
    constructor(input: RenkoInput);
    nextValue(candle: CandleData): RenkoOutput[];
    getResult(): RenkoOutput[];
    static calculate: typeof renko;
}
