import { RSIInput, NumberOrUndefined } from '../types';
export declare function rsi(input: RSIInput): number[];
export declare class RSI {
    private period;
    private values;
    private gains;
    private losses;
    private avgGain;
    private avgLoss;
    private initialized;
    private count;
    constructor(input: RSIInput);
    nextValue(value: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof rsi;
}
