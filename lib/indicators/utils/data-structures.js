// FixedSizeLinkedList implementation for compatibility
export class FixedSizeLinkedList {
    constructor(maxSize) {
        this.data = [];
        this.maxSize = maxSize;
    }
    push(item) {
        if (this.data.length >= this.maxSize) {
            this.data.shift(); // Remove first element
        }
        this.data.push(item);
    }
    get(index) {
        return this.data[index];
    }
    toArray() {
        return [...this.data];
    }
    get length() {
        return this.data.length;
    }
    shift() {
        return this.data.shift();
    }
    pop() {
        return this.data.pop();
    }
    isFull() {
        return this.data.length >= this.maxSize;
    }
    clear() {
        this.data = [];
    }
    getLast(n = 1) {
        return this.data.slice(-n);
    }
    getFirst(n = 1) {
        return this.data.slice(0, n);
    }
}
// CandleList implementation for compatibility
export class CandleList {
    constructor(candles) {
        this.candles = [];
        if (candles) {
            this.candles = [...candles];
        }
    }
    add(candle) {
        this.candles.push(candle);
    }
    get(index) {
        return this.candles[index];
    }
    getCandles() {
        return [...this.candles];
    }
    get length() {
        return this.candles.length;
    }
    slice(start, end) {
        return this.candles.slice(start, end);
    }
    getLast(n = 1) {
        return this.candles.slice(-n);
    }
    getHigh() {
        return this.candles.map(c => c.high);
    }
    getLow() {
        return this.candles.map(c => c.low);
    }
    getOpen() {
        return this.candles.map(c => c.open);
    }
    getClose() {
        return this.candles.map(c => c.close);
    }
    getVolume() {
        return this.candles.map(c => c.volume || 0);
    }
}
// Sum class for compatibility  
export class Sum {
    constructor(input) {
        this.values = [];
        this.period = input.period;
        if (input.values?.length) {
            input.values.forEach(value => this.nextValue(value));
        }
    }
    nextValue(value) {
        this.values.push(value);
        if (this.values.length > this.period) {
            this.values.shift();
        }
        if (this.values.length === this.period) {
            return this.values.reduce((sum, val) => sum + val, 0);
        }
        return undefined;
    }
    getResult() {
        if (this.values.length < this.period) {
            return [];
        }
        return [this.values.reduce((sum, val) => sum + val, 0)];
    }
}
Sum.calculate = sum;
// CrossUp class for compatibility
export class CrossUp {
    constructor() {
        this.lineA = [];
        this.lineB = [];
    }
    nextValue(valueA, valueB) {
        this.lineA.push(valueA);
        this.lineB.push(valueB);
        if (this.lineA.length < 2) {
            return false;
        }
        const prevA = this.lineA[this.lineA.length - 2];
        const prevB = this.lineB[this.lineB.length - 2];
        const currentA = valueA;
        const currentB = valueB;
        return prevA <= prevB && currentA > currentB;
    }
}
CrossUp.calculate = crossUp;
// CrossDown class for compatibility
export class CrossDown {
    constructor() {
        this.lineA = [];
        this.lineB = [];
    }
    nextValue(valueA, valueB) {
        this.lineA.push(valueA);
        this.lineB.push(valueB);
        if (this.lineA.length < 2) {
            return false;
        }
        const prevA = this.lineA[this.lineA.length - 2];
        const prevB = this.lineB[this.lineB.length - 2];
        const currentA = valueA;
        const currentB = valueB;
        return prevA >= prevB && currentA < currentB;
    }
}
CrossDown.calculate = crossDown;
// Re-export from utils/index for backward compatibility
import { crossUp, crossDown, sum } from './index';
export { crossUp, crossDown, sum };
