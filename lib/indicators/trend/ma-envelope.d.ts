import { IndicatorInput } from '../types';
export interface MAEnvelopeInput extends IndicatorInput {
    period: number;
    percentage: number;
    values: number[];
    maType?: 'sma' | 'ema';
}
export interface MAEnvelopeOutput {
    upper?: number;
    middle?: number;
    lower?: number;
}
export declare function maenvelope(input: MAEnvelopeInput): MAEnvelopeOutput[];
export declare class MAEnvelope {
    private period;
    private percentage;
    private maType;
    private values;
    private currentEMA;
    private multiplier;
    constructor(input: MAEnvelopeInput);
    nextValue(value: number): MAEnvelopeOutput | undefined;
    getResult(): MAEnvelopeOutput[];
    static calculate: typeof maenvelope;
}
