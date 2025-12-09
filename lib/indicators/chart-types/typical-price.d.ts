import { IndicatorInput } from '../types';
export interface TypicalPriceInput extends IndicatorInput {
    high: number[];
    low: number[];
    close: number[];
}
export declare function typicalprice(input: TypicalPriceInput): number[];
export declare class TypicalPrice {
    private highValues;
    private lowValues;
    private closeValues;
    constructor(input?: TypicalPriceInput);
    nextValue(high: number, low: number, close: number): number;
    getResult(): number[];
    static calculate: typeof typicalprice;
}
