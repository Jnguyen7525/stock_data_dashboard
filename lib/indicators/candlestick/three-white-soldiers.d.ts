import { CandleData } from '../types';
export interface ThreeWhiteSoldiersInput {
    candles: CandleData[];
}
export declare function threewhitesoldiers(input: ThreeWhiteSoldiersInput): boolean[];
export declare class ThreeWhiteSoldiersPattern {
    private candles;
    constructor(input?: ThreeWhiteSoldiersInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof threewhitesoldiers;
}
