import { CandleData } from '../types';
export interface EveningDojiStarInput {
    candles: CandleData[];
}
export declare function eveningdojistar(input: EveningDojiStarInput): boolean[];
export declare class EveningDojiStar {
    private candles;
    constructor(input?: EveningDojiStarInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof eveningdojistar;
}
