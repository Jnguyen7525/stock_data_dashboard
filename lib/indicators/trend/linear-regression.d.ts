import { IndicatorInput } from '../types';
export interface LinearRegressionInput extends IndicatorInput {
    period: number;
    values: number[];
}
export interface LinearRegressionOutput {
    slope?: number;
    intercept?: number;
    forecast?: number;
    rSquared?: number;
}
export declare function linearregression(input: LinearRegressionInput): LinearRegressionOutput[];
export declare class LinearRegression {
    private period;
    private values;
    constructor(input: LinearRegressionInput);
    nextValue(value: number): LinearRegressionOutput | undefined;
    getResult(): LinearRegressionOutput[];
    static calculate: typeof linearregression;
}
