import { CandleData } from '../types';
export interface EngulfingInput {
    candles: CandleData[];
}
export declare function bullishengulfingpattern(input: EngulfingInput): boolean[];
export declare function bearishengulfingpattern(input: EngulfingInput): boolean[];
export declare class BullishEngulfingPattern {
    private candles;
    constructor(input?: EngulfingInput);
    nextValue(candle: CandleData): boolean;
    static calculate: typeof bullishengulfingpattern;
}
export declare class BearishEngulfingPattern {
    private candles;
    constructor(input?: EngulfingInput);
    nextValue(candle: CandleData): boolean;
    static calculate: typeof bearishengulfingpattern;
}
