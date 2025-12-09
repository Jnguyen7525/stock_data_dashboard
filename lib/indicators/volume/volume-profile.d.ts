import { IndicatorInput } from '../types';
export interface VolumeProfileInput extends IndicatorInput {
    open: number[];
    high: number[];
    low: number[];
    close: number[];
    volume: number[];
    noOfBars?: number;
}
export interface VolumeProfileOutput {
    rangeStart: number;
    rangeEnd: number;
    bullishVolume: number;
    bearishVolume: number;
    totalVolume: number;
}
export declare function volumeprofile(input: VolumeProfileInput): VolumeProfileOutput[];
export declare class VolumeProfile {
    private openValues;
    private highValues;
    private lowValues;
    private closeValues;
    private volumeValues;
    private noOfBars;
    constructor(input: VolumeProfileInput);
    nextValue(open: number, high: number, low: number, close: number, volume: number): void;
    getResult(): VolumeProfileOutput[];
    static calculate: typeof volumeprofile;
}
