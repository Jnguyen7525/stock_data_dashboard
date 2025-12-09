import { IndicatorInput, NumberOrUndefined } from '../types';
export interface WEMAInput extends IndicatorInput {
    period: number;
    values: number[];
}
export declare function wema(input: WEMAInput): number[];
export declare class WEMA {
    private period;
    private alpha;
    private values;
    private previousWEMA;
    private initialized;
    constructor(input: WEMAInput);
    nextValue(value: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof wema;
}
