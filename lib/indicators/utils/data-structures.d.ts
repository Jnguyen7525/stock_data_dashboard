import { CandleData } from '../types';
export declare class FixedSizeLinkedList<T> {
    private data;
    private maxSize;
    constructor(maxSize: number);
    push(item: T): void;
    get(index: number): T | undefined;
    toArray(): T[];
    get length(): number;
    shift(): T | undefined;
    pop(): T | undefined;
    isFull(): boolean;
    clear(): void;
    getLast(n?: number): T[];
    getFirst(n?: number): T[];
}
export declare class CandleList {
    private candles;
    constructor(candles?: CandleData[]);
    add(candle: CandleData): void;
    get(index: number): CandleData | undefined;
    getCandles(): CandleData[];
    get length(): number;
    slice(start?: number, end?: number): CandleData[];
    getLast(n?: number): CandleData[];
    getHigh(): number[];
    getLow(): number[];
    getOpen(): number[];
    getClose(): number[];
    getVolume(): number[];
}
export declare class Sum {
    private period;
    private values;
    constructor(input: {
        period: number;
        values?: number[];
    });
    nextValue(value: number): number | undefined;
    getResult(): number[];
    static calculate: typeof sum;
}
export declare class CrossUp {
    private lineA;
    private lineB;
    constructor();
    nextValue(valueA: number, valueB: number): boolean;
    static calculate: typeof crossUp;
}
export declare class CrossDown {
    private lineA;
    private lineB;
    constructor();
    nextValue(valueA: number, valueB: number): boolean;
    static calculate: typeof crossDown;
}
import { crossUp, crossDown, sum } from './index';
export { crossUp, crossDown, sum };
