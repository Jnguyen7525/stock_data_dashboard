import { IndicatorInput } from '../types';
export interface SuperTrendInput extends IndicatorInput {
    period: number;
    multiplier: number;
    high: number[];
    low: number[];
    close: number[];
}
export interface SuperTrendOutput {
    supertrend?: number;
    direction?: number;
}
export declare function supertrend(input: SuperTrendInput): SuperTrendOutput[];
export declare class SuperTrend {
    private period;
    private multiplier;
    private highValues;
    private lowValues;
    private closeValues;
    private trueRanges;
    private currentATR;
    private initialized;
    private supertrendValue;
    private direction;
    private previousFinalUpperBand;
    private previousFinalLowerBand;
    private previousDirection;
    constructor(input: SuperTrendInput);
    nextValue(high: number, low: number, close: number): SuperTrendOutput | undefined;
    getResult(): SuperTrendOutput[];
    static calculate: typeof supertrend;
}
