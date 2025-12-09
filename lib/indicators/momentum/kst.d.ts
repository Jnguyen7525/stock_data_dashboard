import { IndicatorInput } from '../types';
export interface KSTInput extends IndicatorInput {
    values: number[];
    ROCPer1?: number;
    ROCPer2?: number;
    ROCPer3?: number;
    ROCPer4?: number;
    SMAROCPer1?: number;
    SMAROCPer2?: number;
    SMAROCPer3?: number;
    SMAROCPer4?: number;
    signalPeriod?: number;
}
export interface KSTOutput {
    kst?: number;
    signal?: number;
}
export declare function kst(input: KSTInput): KSTOutput[];
export declare class KST {
    private ROCPer1;
    private ROCPer2;
    private ROCPer3;
    private ROCPer4;
    private SMAROCPer1;
    private SMAROCPer2;
    private SMAROCPer3;
    private SMAROCPer4;
    private signalPeriod;
    private values;
    private firstResult;
    private roc1Values;
    private roc2Values;
    private roc3Values;
    private roc4Values;
    private kstValues;
    private results;
    constructor(input: KSTInput);
    nextValue(value: number): KSTOutput | undefined;
    getResult(): KSTOutput[];
    static calculate: typeof kst;
}
