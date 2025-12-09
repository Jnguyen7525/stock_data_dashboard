import { MACDInput, MACDOutput } from '../types';
export declare function macd(input: MACDInput): MACDOutput[];
export declare class MACD {
    private fastPeriod;
    private slowPeriod;
    private signalPeriod;
    private fastEMA;
    private slowEMA;
    private signalEMA;
    private macdHistory;
    private initialized;
    private count;
    constructor(input: MACDInput);
    nextValue(value: number): MACDOutput | undefined;
    getResult(): MACDOutput[];
    static calculate: typeof macd;
}
