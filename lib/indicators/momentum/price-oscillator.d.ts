import { IndicatorInput, NumberOrUndefined } from '../types';
export interface PriceOscillatorInput extends IndicatorInput {
    fastPeriod: number;
    slowPeriod: number;
    values: number[];
    maType?: 'sma' | 'ema';
}
export declare function priceoscillator(input: PriceOscillatorInput): number[];
export declare class PriceOscillator {
    private fastPeriod;
    private slowPeriod;
    private maType;
    private values;
    private fastEMA;
    private slowEMA;
    private fastMultiplier;
    private slowMultiplier;
    constructor(input: PriceOscillatorInput);
    nextValue(value: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof priceoscillator;
}
