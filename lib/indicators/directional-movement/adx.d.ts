import { IndicatorInput } from '../types';
export interface ADXInput extends IndicatorInput {
    period: number;
    smoothingPeriod?: number;
    high: number[];
    low: number[];
    close: number[];
}
export interface ADXOutput {
    adx?: number;
    pdi?: number;
    mdi?: number;
}
export declare function adx(input: ADXInput): ADXOutput[];
export declare class ADX {
    private period;
    private smoothingPeriod;
    private highValues;
    private lowValues;
    private closeValues;
    private plusDMValues;
    private minusDMValues;
    private trValues;
    private smoothedPlusDM;
    private smoothedMinusDM;
    private smoothedTR;
    private exponent;
    private adxEMA;
    private smaSum;
    private smaCount;
    private results;
    constructor(input: ADXInput);
    nextValue(high: number, low: number, close: number): ADXOutput | undefined;
    getResult(): ADXOutput[];
    static calculate: typeof adx;
}
