import { IndicatorInput, NumberOrUndefined } from '../types';
export interface AwesomeOscillatorInput extends IndicatorInput {
    high: number[];
    low: number[];
    fastPeriod?: number;
    slowPeriod?: number;
}
export declare function awesomeoscillator(input: AwesomeOscillatorInput): number[];
export declare class AwesomeOscillator {
    private fastPeriod;
    private slowPeriod;
    private highValues;
    private lowValues;
    private midpoints;
    private fastSMACalculator;
    private slowSMACalculator;
    constructor(input: AwesomeOscillatorInput);
    nextValue(high: number, low: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof awesomeoscillator;
}
