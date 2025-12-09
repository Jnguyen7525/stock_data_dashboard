import { IndicatorInput } from '../types';
export interface KeltnerChannelsInput extends IndicatorInput {
    high: number[];
    low: number[];
    close: number[];
    period?: number;
    multiplier?: number;
}
export interface KeltnerChannelsOutput {
    middle?: number;
    upper?: number;
    lower?: number;
}
export declare function keltnerchannel(input: KeltnerChannelsInput): KeltnerChannelsOutput[];
export declare class KeltnerChannels {
    private period;
    private multiplier;
    private highValues;
    private lowValues;
    private closeValues;
    constructor(input: KeltnerChannelsInput);
    nextValue(high: number, low: number, close: number): KeltnerChannelsOutput | undefined;
    getResult(): KeltnerChannelsOutput[];
    static calculate: typeof keltnerchannel;
}
