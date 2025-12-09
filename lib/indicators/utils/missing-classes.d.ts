import { NumberOrUndefined } from '../types';
export declare class AverageGain {
    private period;
    private values;
    private gains;
    private avgGain;
    private initialized;
    constructor(input: {
        period: number;
        values?: number[];
    });
    nextValue(value: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof averagegain;
}
export declare class AverageLoss {
    private period;
    private values;
    private losses;
    private avgLoss;
    private initialized;
    constructor(input: {
        period: number;
        values?: number[];
    });
    nextValue(value: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof averageloss;
}
export declare class SD {
    private period;
    private values;
    constructor(input: {
        period: number;
        values?: number[];
    });
    nextValue(value: number): NumberOrUndefined;
    getResult(): number[];
    static calculate: typeof sd;
}
import { averageGain as averagegain, averageLoss as averageloss, sd } from './index';
