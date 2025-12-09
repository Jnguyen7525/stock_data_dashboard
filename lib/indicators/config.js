let globalConfig = {
    precision: 2,
    epsilon: 0.0001
};
export function setConfig(config) {
    globalConfig = { ...globalConfig, ...config };
}
export function getConfig() {
    return { ...globalConfig };
}
// Helper function to get specific config values
export function getPrecision() {
    return globalConfig.precision || 2;
}
export function getEpsilon() {
    return globalConfig.epsilon || 0.0001;
}
// Helper function to format numbers based on precision
export function formatValue(value) {
    const precision = getPrecision();
    return parseFloat(value.toFixed(precision));
}
// Helper function to check if two values are approximately equal
export function isEqual(a, b) {
    return Math.abs(a - b) < getEpsilon();
}
