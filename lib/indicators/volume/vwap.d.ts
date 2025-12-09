export interface VWAPInput {
    high: number[];
    low: number[];
    close: number[];
    volume: number[];
}
export declare function vwap(input: VWAPInput): number[];
export declare class VWAP {
    private cumulativePV;
    private cumulativeVolume;
    constructor(input?: VWAPInput);
    nextValue(high: number, low: number, close: number, volume: number): number;
    getResult(): number[];
    static calculate: typeof vwap;
}
