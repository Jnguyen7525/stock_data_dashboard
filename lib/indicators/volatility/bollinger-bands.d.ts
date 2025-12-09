import { BollingerBandsInput, BollingerBandsOutput } from '../types';
export declare function bollingerbands(input: BollingerBandsInput): BollingerBandsOutput[];
export declare class BollingerBands {
    private period;
    private stdDev;
    private values;
    constructor(input: BollingerBandsInput);
    nextValue(value: number): BollingerBandsOutput | undefined;
    getResult(): BollingerBandsOutput[];
    static calculate: typeof bollingerbands;
}
