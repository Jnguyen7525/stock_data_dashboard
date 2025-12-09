import { CandleData } from '../types';
export interface BearishHaramiCrossInput {
    candles: CandleData[];
}
export declare function bearishharamicross(input: BearishHaramiCrossInput): boolean[];
export declare class BearishHaramiCross {
    private candles;
    constructor(input?: BearishHaramiCrossInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof bearishharamicross;
}
