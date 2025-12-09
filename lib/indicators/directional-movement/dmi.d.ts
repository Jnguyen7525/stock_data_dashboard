import { IndicatorInput } from '../types';
export interface DMIInput extends IndicatorInput {
    period: number;
    adxSmoothing: number;
    high: number[];
    low: number[];
    close: number[];
}
export interface DMIOutput {
    pdi: number;
    mdi: number;
    adx: number;
}
export declare function dmi(input: DMIInput): DMIOutput[];
export declare class DMI {
    private period;
    private adxSmoothing;
    private highValues;
    private lowValues;
    private closeValues;
    private plusDMValues;
    private minusDMValues;
    private trValues;
    private dxValues;
    private smoothedPlusDM;
    private smoothedMinusDM;
    private smoothedTR;
    private smoothedDX;
    private results;
    constructor(input: DMIInput);
    nextValue(high: number, low: number, close: number): DMIOutput | undefined;
    getResult(): DMIOutput[];
    static calculate: typeof dmi;
}
