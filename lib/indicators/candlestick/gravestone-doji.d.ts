import { CandleData } from '../types';
export interface GravestoneDojiInput {
    candles: CandleData[];
}
export declare function gravestonedoji(input: GravestoneDojiInput): boolean[];
export declare class GravestoneDojiPattern {
    private candles;
    constructor(input?: GravestoneDojiInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof gravestonedoji;
}
