import { CandleData } from './types';
export interface StockDataInput {
    open: number[];
    high: number[];
    low: number[];
    close: number[];
    volume?: number[];
    timestamp?: (string | number | Date)[];
}
export interface StockDataPoint {
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
    timestamp?: string | number | Date;
}
export declare class StockData {
    private data;
    constructor(input?: StockDataInput);
    loadData(input: StockDataInput): void;
    addDataPoint(point: StockDataPoint): void;
    getCandles(): CandleData[];
    getOpen(): number[];
    getHigh(): number[];
    getLow(): number[];
    getClose(): number[];
    getVolume(): number[];
    getTimestamp(): (string | number | Date)[];
    getDataPoints(): StockDataPoint[];
    getLastDataPoint(): StockDataPoint | undefined;
    getDataPoint(index: number): StockDataPoint | undefined;
    length(): number;
    slice(start?: number, end?: number): StockData;
    reverse(): StockData;
    static fromArray(candles: CandleData[]): StockData;
    static fromOHLC(open: number[], high: number[], low: number[], close: number[]): StockData;
    isValid(): boolean;
    validateData(): string[];
}
