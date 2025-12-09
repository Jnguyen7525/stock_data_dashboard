export function mfi(input) {
    const { period = 14, high, low, close, volume } = input;
    if (high.length !== low.length || low.length !== close.length ||
        close.length !== volume.length || high.length === 0) {
        return [];
    }
    const result = [];
    // Mimic FixedSizeLinkedList behavior with periodSum tracking
    const positiveFlows = [];
    const negativeFlows = [];
    let totalPushed = 0;
    let prevTypicalPrice = null;
    let typicalPriceValue = null;
    // Simulate generator behavior:
    // First tick = yield; (consumes first value)
    // lastClose = tick.close; (stores but doesn't use it)
    // tick = yield; (consumes second value, starts processing loop)
    let firstTick = true;
    for (let i = 0; i < high.length; i++) {
        if (firstTick) {
            // First yield - just consume the value like the generator
            prevTypicalPrice = (high[i] + low[i] + close[i]) / 3;
            firstTick = false;
            continue;
        }
        const tick = { high: high[i], low: low[i], close: close[i], volume: volume[i] };
        let positiveMoney = 0;
        let negativeMoney = 0;
        // Calculate typical price (like TypicalPrice.nextValue)
        typicalPriceValue = (tick.high + tick.low + tick.close) / 3;
        const rawMoneyFlow = typicalPriceValue * tick.volume;
        if (typicalPriceValue != null && prevTypicalPrice != null) {
            // Reference logic: > goes to positive, otherwise goes to negative (includes equal)
            if (typicalPriceValue > prevTypicalPrice) {
                positiveMoney = rawMoneyFlow;
            }
            else {
                negativeMoney = rawMoneyFlow; // This includes < and = cases
            }
            positiveFlows.push(positiveMoney);
            negativeFlows.push(negativeMoney);
            totalPushed++;
            // Keep only period-sized window
            if (positiveFlows.length > period) {
                positiveFlows.shift();
                negativeFlows.shift();
            }
            const positiveFlowForPeriod = positiveFlows.reduce((sum, flow) => sum + flow, 0);
            const negativeFlowForPeriod = negativeFlows.reduce((sum, flow) => sum + flow, 0);
            // Reference condition: (positiveFlow.totalPushed >= period) && (positiveFlow.totalPushed >= period)
            // But we need one extra delay to match their exact timing
            if (totalPushed > period) {
                const moneyFlowRatio = positiveFlowForPeriod / negativeFlowForPeriod;
                const mfiResult = 100 - 100 / (1 + moneyFlowRatio);
                result.push(parseFloat(mfiResult.toFixed(2)));
            }
        }
        prevTypicalPrice = typicalPriceValue;
    }
    return result;
}
export class MFI {
    constructor(input) {
        this.positiveFlows = [];
        this.negativeFlows = [];
        this.prevTypicalPrice = null;
        this.results = [];
        this.totalPushed = 0;
        this.period = input.period || 14;
    }
    nextValue(high, low, close, volume) {
        let positiveMoney = 0;
        let negativeMoney = 0;
        // Calculate typical price (like TypicalPrice.nextValue)
        const typicalPriceValue = (high + low + close) / 3;
        const rawMoneyFlow = typicalPriceValue * volume;
        if (typicalPriceValue != null && this.prevTypicalPrice != null) {
            // Reference logic: > goes to positive, otherwise goes to negative (includes equal)
            if (typicalPriceValue > this.prevTypicalPrice) {
                positiveMoney = rawMoneyFlow;
            }
            else {
                negativeMoney = rawMoneyFlow; // This includes < and = cases
            }
            this.positiveFlows.push(positiveMoney);
            this.negativeFlows.push(negativeMoney);
            this.totalPushed++;
            // Keep only period-sized window
            if (this.positiveFlows.length > this.period) {
                this.positiveFlows.shift();
                this.negativeFlows.shift();
            }
            const positiveFlowForPeriod = this.positiveFlows.reduce((sum, flow) => sum + flow, 0);
            const negativeFlowForPeriod = this.negativeFlows.reduce((sum, flow) => sum + flow, 0);
            // Reference condition: (positiveFlow.totalPushed >= period) && (positiveFlow.totalPushed >= period)
            // But we need one extra delay to match their exact timing
            if (this.totalPushed > this.period) {
                const moneyFlowRatio = positiveFlowForPeriod / negativeFlowForPeriod;
                const mfiResult = 100 - 100 / (1 + moneyFlowRatio);
                const result = parseFloat(mfiResult.toFixed(2));
                this.results.push(result);
                this.prevTypicalPrice = typicalPriceValue;
                return result;
            }
        }
        this.prevTypicalPrice = typicalPriceValue;
        return undefined;
    }
    getResult() {
        return this.results;
    }
}
MFI.calculate = mfi;
