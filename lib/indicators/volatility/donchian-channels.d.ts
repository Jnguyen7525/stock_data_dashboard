import { IndicatorInput } from '../types';
export interface DonchianChannelsInput extends IndicatorInput {
    period: number;
    high: number[];
    low: number[];
}
export interface DonchianChannelsOutput {
    upper?: number;
    middle?: number;
    lower?: number;
    width?: number;
}
export declare function donchianchannels(input: DonchianChannelsInput): DonchianChannelsOutput[];
export declare class DonchianChannels {
    private period;
    private highValues;
    private lowValues;
    constructor(input: DonchianChannelsInput);
    nextValue(high: number, low: number): DonchianChannelsOutput | undefined;
    getResult(): DonchianChannelsOutput[];
    static calculate: typeof donchianchannels;
}
