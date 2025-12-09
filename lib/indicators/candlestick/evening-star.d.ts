import { CandleData } from '../types';
export interface EveningStarInput {
    candles: CandleData[];
}
export declare function eveningstar(input: EveningStarInput): boolean[];
export declare class EveningStar {
    private candles;
    constructor(input?: EveningStarInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof eveningstar;
}
