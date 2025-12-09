import { NumberOrUndefined } from '../types';
export interface ADLInput {
    high: number[];
    low: number[];
    close: number[];
    volume: number[];
}
export declare function adl(input: ADLInput): number[];
export declare class ADL {
    private cumulativeADL;
    constructor(input?: ADLInput);
    nextValue(high: number, low: number, close: number, volume: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof adl;
}
