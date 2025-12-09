export class StockData {
    constructor(input) {
        this.data = [];
        if (input) {
            this.loadData(input);
        }
    }
    loadData(input) {
        const { open, high, low, close, volume, timestamp } = input;
        // Validate data consistency
        if (open.length !== high.length ||
            high.length !== low.length ||
            low.length !== close.length) {
            throw new Error('OHLC arrays must have the same length');
        }
        if (volume && volume.length !== close.length) {
            throw new Error('Volume array length must match OHLC arrays');
        }
        if (timestamp && timestamp.length !== close.length) {
            throw new Error('Timestamp array length must match OHLC arrays');
        }
        this.data = [];
        for (let i = 0; i < open.length; i++) {
            const point = {
                open: open[i],
                high: high[i],
                low: low[i],
                close: close[i]
            };
            if (volume) {
                point.volume = volume[i];
            }
            if (timestamp) {
                point.timestamp = timestamp[i];
            }
            this.data.push(point);
        }
    }
    addDataPoint(point) {
        this.data.push(point);
    }
    getCandles() {
        return this.data.map(point => ({
            open: point.open,
            high: point.high,
            low: point.low,
            close: point.close
        }));
    }
    getOpen() {
        return this.data.map(point => point.open);
    }
    getHigh() {
        return this.data.map(point => point.high);
    }
    getLow() {
        return this.data.map(point => point.low);
    }
    getClose() {
        return this.data.map(point => point.close);
    }
    getVolume() {
        return this.data.map(point => point.volume || 0);
    }
    getTimestamp() {
        return this.data.map(point => point.timestamp || '');
    }
    getDataPoints() {
        return [...this.data];
    }
    getLastDataPoint() {
        return this.data[this.data.length - 1];
    }
    getDataPoint(index) {
        return this.data[index];
    }
    length() {
        return this.data.length;
    }
    slice(start, end) {
        const slicedData = this.data.slice(start, end);
        const newStockData = new StockData();
        newStockData.data = slicedData;
        return newStockData;
    }
    reverse() {
        const reversedData = [...this.data].reverse();
        const newStockData = new StockData();
        newStockData.data = reversedData;
        return newStockData;
    }
    // Utility methods for common operations
    static fromArray(candles) {
        const stockData = new StockData();
        stockData.data = candles.map(candle => ({
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close
        }));
        return stockData;
    }
    static fromOHLC(open, high, low, close) {
        return new StockData({ open, high, low, close });
    }
    // Validation methods
    isValid() {
        return this.data.every(point => point.high >= Math.max(point.open, point.close) &&
            point.low <= Math.min(point.open, point.close) &&
            point.high >= point.low);
    }
    validateData() {
        const errors = [];
        this.data.forEach((point, index) => {
            if (point.high < Math.max(point.open, point.close)) {
                errors.push(`Data point ${index}: High (${point.high}) is less than max of open/close`);
            }
            if (point.low > Math.min(point.open, point.close)) {
                errors.push(`Data point ${index}: Low (${point.low}) is greater than min of open/close`);
            }
            if (point.high < point.low) {
                errors.push(`Data point ${index}: High (${point.high}) is less than low (${point.low})`);
            }
        });
        return errors;
    }
}
