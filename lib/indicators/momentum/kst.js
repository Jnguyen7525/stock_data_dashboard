export function kst(input) {
    const { values, ROCPer1 = 10, ROCPer2 = 15, ROCPer3 = 20, ROCPer4 = 30, SMAROCPer1 = 10, SMAROCPer2 = 10, SMAROCPer3 = 10, SMAROCPer4 = 15, signalPeriod = 9 } = input;
    if (!values || values.length === 0) {
        return [];
    }
    const result = [];
    // Calculate minimum required data points for first result
    const firstResult = Math.max(ROCPer1 + SMAROCPer1, ROCPer2 + SMAROCPer2, ROCPer3 + SMAROCPer3, ROCPer4 + SMAROCPer4);
    if (values.length < firstResult) {
        return [];
    }
    // Arrays to store ROC values for SMA calculation
    const roc1Values = [];
    const roc2Values = [];
    const roc3Values = [];
    const roc4Values = [];
    // Arrays to store SMA values for each ROC
    let sma1Values = [];
    let sma2Values = [];
    let sma3Values = [];
    let sma4Values = [];
    // KST values for signal calculation
    const kstValues = [];
    for (let i = 0; i < values.length; i++) {
        // Calculate ROC values
        let roc1Value;
        let roc2Value;
        let roc3Value;
        let roc4Value;
        if (i >= ROCPer1) {
            roc1Value = ((values[i] - values[i - ROCPer1]) / values[i - ROCPer1]) * 100;
            roc1Values.push(roc1Value);
        }
        if (i >= ROCPer2) {
            roc2Value = ((values[i] - values[i - ROCPer2]) / values[i - ROCPer2]) * 100;
            roc2Values.push(roc2Value);
        }
        if (i >= ROCPer3) {
            roc3Value = ((values[i] - values[i - ROCPer3]) / values[i - ROCPer3]) * 100;
            roc3Values.push(roc3Value);
        }
        if (i >= ROCPer4) {
            roc4Value = ((values[i] - values[i - ROCPer4]) / values[i - ROCPer4]) * 100;
            roc4Values.push(roc4Value);
        }
        // Calculate SMA values
        let rcma1;
        let rcma2;
        let rcma3;
        let rcma4;
        if (roc1Values.length >= SMAROCPer1) {
            const sma1Sum = roc1Values.slice(-SMAROCPer1).reduce((sum, val) => sum + val, 0);
            rcma1 = sma1Sum / SMAROCPer1;
        }
        if (roc2Values.length >= SMAROCPer2) {
            const sma2Sum = roc2Values.slice(-SMAROCPer2).reduce((sum, val) => sum + val, 0);
            rcma2 = sma2Sum / SMAROCPer2;
        }
        if (roc3Values.length >= SMAROCPer3) {
            const sma3Sum = roc3Values.slice(-SMAROCPer3).reduce((sum, val) => sum + val, 0);
            rcma3 = sma3Sum / SMAROCPer3;
        }
        if (roc4Values.length >= SMAROCPer4) {
            const sma4Sum = roc4Values.slice(-SMAROCPer4).reduce((sum, val) => sum + val, 0);
            rcma4 = sma4Sum / SMAROCPer4;
        }
        // Calculate KST if we have all components
        if (i >= firstResult - 1 && rcma1 !== undefined && rcma2 !== undefined && rcma3 !== undefined && rcma4 !== undefined) {
            const kstValue = (rcma1 * 1) + (rcma2 * 2) + (rcma3 * 3) + (rcma4 * 4);
            kstValues.push(kstValue);
            // Calculate signal (SMA of KST)
            let signalValue;
            if (kstValues.length >= signalPeriod) {
                const signalSum = kstValues.slice(-signalPeriod).reduce((sum, val) => sum + val, 0);
                signalValue = signalSum / signalPeriod;
            }
            result.push({
                kst: kstValue,
                signal: signalValue
            });
        }
    }
    return result;
}
export class KST {
    constructor(input) {
        this.values = [];
        // Arrays to store ROC values for SMA calculation
        this.roc1Values = [];
        this.roc2Values = [];
        this.roc3Values = [];
        this.roc4Values = [];
        // KST values for signal calculation
        this.kstValues = [];
        this.results = [];
        this.ROCPer1 = input.ROCPer1 || 10;
        this.ROCPer2 = input.ROCPer2 || 15;
        this.ROCPer3 = input.ROCPer3 || 20;
        this.ROCPer4 = input.ROCPer4 || 30;
        this.SMAROCPer1 = input.SMAROCPer1 || 10;
        this.SMAROCPer2 = input.SMAROCPer2 || 10;
        this.SMAROCPer3 = input.SMAROCPer3 || 10;
        this.SMAROCPer4 = input.SMAROCPer4 || 15;
        this.signalPeriod = input.signalPeriod || 9;
        this.firstResult = Math.max(this.ROCPer1 + this.SMAROCPer1, this.ROCPer2 + this.SMAROCPer2, this.ROCPer3 + this.SMAROCPer3, this.ROCPer4 + this.SMAROCPer4);
        if (input.values && input.values.length) {
            input.values.forEach(value => this.nextValue(value));
        }
    }
    nextValue(value) {
        this.values.push(value);
        const i = this.values.length - 1;
        // Calculate ROC values
        if (i >= this.ROCPer1) {
            const roc1Value = ((value - this.values[i - this.ROCPer1]) / this.values[i - this.ROCPer1]) * 100;
            this.roc1Values.push(roc1Value);
        }
        if (i >= this.ROCPer2) {
            const roc2Value = ((value - this.values[i - this.ROCPer2]) / this.values[i - this.ROCPer2]) * 100;
            this.roc2Values.push(roc2Value);
        }
        if (i >= this.ROCPer3) {
            const roc3Value = ((value - this.values[i - this.ROCPer3]) / this.values[i - this.ROCPer3]) * 100;
            this.roc3Values.push(roc3Value);
        }
        if (i >= this.ROCPer4) {
            const roc4Value = ((value - this.values[i - this.ROCPer4]) / this.values[i - this.ROCPer4]) * 100;
            this.roc4Values.push(roc4Value);
        }
        // Calculate SMA values
        let rcma1;
        let rcma2;
        let rcma3;
        let rcma4;
        if (this.roc1Values.length >= this.SMAROCPer1) {
            const sma1Sum = this.roc1Values.slice(-this.SMAROCPer1).reduce((sum, val) => sum + val, 0);
            rcma1 = sma1Sum / this.SMAROCPer1;
        }
        if (this.roc2Values.length >= this.SMAROCPer2) {
            const sma2Sum = this.roc2Values.slice(-this.SMAROCPer2).reduce((sum, val) => sum + val, 0);
            rcma2 = sma2Sum / this.SMAROCPer2;
        }
        if (this.roc3Values.length >= this.SMAROCPer3) {
            const sma3Sum = this.roc3Values.slice(-this.SMAROCPer3).reduce((sum, val) => sum + val, 0);
            rcma3 = sma3Sum / this.SMAROCPer3;
        }
        if (this.roc4Values.length >= this.SMAROCPer4) {
            const sma4Sum = this.roc4Values.slice(-this.SMAROCPer4).reduce((sum, val) => sum + val, 0);
            rcma4 = sma4Sum / this.SMAROCPer4;
        }
        // Calculate KST if we have all components
        if (i >= this.firstResult - 1 && rcma1 !== undefined && rcma2 !== undefined && rcma3 !== undefined && rcma4 !== undefined) {
            const kstValue = (rcma1 * 1) + (rcma2 * 2) + (rcma3 * 3) + (rcma4 * 4);
            this.kstValues.push(kstValue);
            // Calculate signal (SMA of KST)
            let signalValue;
            if (this.kstValues.length >= this.signalPeriod) {
                const signalSum = this.kstValues.slice(-this.signalPeriod).reduce((sum, val) => sum + val, 0);
                signalValue = signalSum / this.signalPeriod;
            }
            const result = {
                kst: kstValue,
                signal: signalValue
            };
            this.results.push(result);
            return result;
        }
        return undefined;
    }
    getResult() {
        return this.results;
    }
}
KST.calculate = kst;
