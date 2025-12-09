export declare class NumberFormatter {
    private precision;
    constructor(precision?: number);
    format(value: number): number;
    static format(value: number, precision?: number): number;
    static formatArray(values: number[], precision?: number): number[];
    setPrecision(precision: number): void;
    getPrecision(): number;
}
export declare function formatNumber(value: number, precision?: number): number;
export declare function formatNumbers(values: number[], precision?: number): number[];
