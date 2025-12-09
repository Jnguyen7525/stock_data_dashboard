export interface FibonacciInput {
    high: number;
    low: number;
    trend?: 'up' | 'down';
}
export interface FibonacciOutput {
    level: number;
    value: number;
    percentage: string;
}
export declare function fibonacci(input: FibonacciInput): FibonacciOutput[];
export declare function fibonacciExtensions(input: FibonacciInput): FibonacciOutput[];
export declare function fibonacciProjection(input: {
    prices: number[];
    swingPoints: number[];
}): FibonacciOutput[];
export declare class Fibonacci {
    private high;
    private low;
    private trend;
    constructor(input: FibonacciInput);
    getRetracements(): FibonacciOutput[];
    getExtensions(): FibonacciOutput[];
    updateLevels(high: number, low: number, trend?: 'up' | 'down'): void;
    static calculate: typeof fibonacci;
    static extensions: typeof fibonacciExtensions;
    static projection: typeof fibonacciProjection;
}
