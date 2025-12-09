import { CandleData } from '../types';
export interface DarkCloudCoverInput {
    candles: CandleData[];
}
export declare function darkcloudcover(input: DarkCloudCoverInput): boolean[];
export declare class DarkCloudCover {
    private candles;
    constructor(input?: DarkCloudCoverInput);
    nextValue(candle: CandleData): boolean;
    getResult(): boolean[];
    static calculate: typeof darkcloudcover;
}
