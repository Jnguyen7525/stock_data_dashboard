import { NumberOrUndefined } from '../types';
export interface OBVInput {
    close: number[];
    volume: number[];
}
export declare function obv(input: OBVInput): number[];
export declare class OBV {
    private closeValues;
    private volumeValues;
    private cumulativeVolume;
    private initialized;
    constructor(input?: {
        close?: number[];
        volume?: number[];
    });
    nextValue(close: number, volume: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof obv;
}
