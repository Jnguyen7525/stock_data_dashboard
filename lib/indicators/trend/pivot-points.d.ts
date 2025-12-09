import { IndicatorInput } from '../types';
export interface PivotPointsInput extends IndicatorInput {
    high: number[];
    low: number[];
    close: number[];
    type?: 'standard' | 'fibonacci' | 'camarilla' | 'woodie';
}
export interface PivotPointsOutput {
    pivot?: number;
    r1?: number;
    r2?: number;
    r3?: number;
    r4?: number;
    s1?: number;
    s2?: number;
    s3?: number;
    s4?: number;
}
export declare function pivotpoints(input: PivotPointsInput): PivotPointsOutput[];
export declare class PivotPoints {
    private type;
    private previousHigh?;
    private previousLow?;
    private previousClose?;
    private results;
    constructor(input: PivotPointsInput);
    nextValue(high: number, low: number, close: number): PivotPointsOutput;
    getResult(): PivotPointsOutput[];
    static calculate: typeof pivotpoints;
}
