export class NumberFormatter {
    constructor(precision = 2) {
        this.precision = precision;
    }
    format(value) {
        if (typeof value !== 'number' || !isFinite(value)) {
            return value;
        }
        return parseFloat(value.toFixed(this.precision));
    }
    static format(value, precision = 2) {
        if (typeof value !== 'number' || !isFinite(value)) {
            return value;
        }
        return parseFloat(value.toFixed(precision));
    }
    static formatArray(values, precision = 2) {
        return values.map(value => NumberFormatter.format(value, precision));
    }
    setPrecision(precision) {
        this.precision = precision;
    }
    getPrecision() {
        return this.precision;
    }
}
// Utility function for direct formatting
export function formatNumber(value, precision = 2) {
    return NumberFormatter.format(value, precision);
}
export function formatNumbers(values, precision = 2) {
    return NumberFormatter.formatArray(values, precision);
}
