import { CandleData } from '../types';
export interface ShootingStarInput {
    candles: CandleData[];
}
export declare function shootingstar(input: ShootingStarInput): boolean[];
export declare class ShootingStarPattern {
    private candles;
    constructor(input?: ShootingStarInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof shootingstar;
}
