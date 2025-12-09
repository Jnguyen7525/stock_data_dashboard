import { NumberOrUndefined } from '../types';
export declare function highest(input: {
    period: number;
    values: number[];
}): number[];
export declare function lowest(input: {
    period: number;
    values: number[];
}): number[];
export declare function sd(input: {
    period: number;
    values: number[];
}): number[];
export declare function sum(input: {
    period: number;
    values: number[];
}): number[];
export declare function averageGain(input: {
    period: number;
    values: number[];
}): number[];
export declare function averageLoss(input: {
    period: number;
    values: number[];
}): number[];
export declare function crossUp(input: {
    lineA: number[];
    lineB: number[];
}): boolean[];
export declare function crossDown(input: {
    lineA: number[];
    lineB: number[];
}): boolean[];
export declare class Highest {
    private period;
    private values;
    constructor(input: {
        period: number;
        values?: number[];
    });
    nextValue(value: number): NumberOrUndefined;
    static calculate: typeof highest;
}
export declare class Lowest {
    private period;
    private values;
    constructor(input: {
        period: number;
        values?: number[];
    });
    nextValue(value: number): NumberOrUndefined;
    static calculate: typeof lowest;
}
