import { CandleData } from '../types';
export interface MorningDojiStarInput {
    candles: CandleData[];
}
export declare function morningdojistar(input: MorningDojiStarInput): boolean[];
export declare class MorningDojiStar {
    private candles;
    constructor(input?: MorningDojiStarInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof morningdojistar;
}
