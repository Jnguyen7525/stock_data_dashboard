import { CandleData } from '../types';
export interface ShootingStarUnconfirmedInput {
    candles: CandleData[];
}
export declare function shootingstarunconfirmed(input: ShootingStarUnconfirmedInput): boolean[];
export declare class ShootingStarUnconfirmed {
    private candles;
    constructor(input?: ShootingStarUnconfirmedInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof shootingstarunconfirmed;
}
