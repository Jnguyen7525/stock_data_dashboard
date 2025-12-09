import { IndicatorInput } from '../types';
export interface PPOInput extends IndicatorInput {
    fastPeriod: number;
    slowPeriod: number;
    signalPeriod: number;
    values: number[];
}
export interface PPOOutput {
    ppo?: number;
    signal?: number;
    histogram?: number;
}
export declare function ppo(input: PPOInput): PPOOutput[];
export declare class PPO {
    private fastPeriod;
    private slowPeriod;
    private signalPeriod;
    private values;
    private fastEMA;
    private slowEMA;
    private signalEMA;
    private ppoValues;
    private fastMultiplier;
    private slowMultiplier;
    private signalMultiplier;
    constructor(input: PPOInput);
    nextValue(value: number): PPOOutput | undefined;
    getResult(): PPOOutput[];
    static calculate: typeof ppo;
}
