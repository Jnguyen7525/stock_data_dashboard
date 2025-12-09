import { CandleData } from '../types';
export interface DragonflyDojiInput {
    candles: CandleData[];
}
export declare function dragonflydoji(input: DragonflyDojiInput): boolean[];
export declare class DragonflyDojiPattern {
    private candles;
    constructor(input?: DragonflyDojiInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof dragonflydoji;
}
