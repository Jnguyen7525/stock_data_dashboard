import { IndicatorInput } from '../types';
export interface IchimokuInput extends IndicatorInput {
    high: number[];
    low: number[];
    conversionPeriod?: number;
    basePeriod?: number;
    spanPeriod?: number;
    displacement?: number;
}
export interface IchimokuOutput {
    conversion?: number;
    base?: number;
    spanA?: number;
    spanB?: number;
    lagging?: number;
}
export declare function ichimokukinkouhyou(input: IchimokuInput): IchimokuOutput[];
export declare class IchimokuKinkouhyou {
    private conversionPeriod;
    private basePeriod;
    private spanPeriod;
    private displacement;
    private highValues;
    private lowValues;
    private result;
    private period;
    constructor(input: IchimokuInput);
    nextValue(high: number, low: number): IchimokuOutput | undefined;
    getResult(): IchimokuOutput[];
    static calculate: typeof ichimokukinkouhyou;
}
export declare const IchimokuCloud: typeof IchimokuKinkouhyou;
export declare const ichimokucloud: typeof ichimokukinkouhyou;
