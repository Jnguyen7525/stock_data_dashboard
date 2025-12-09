interface Config {
    precision?: number;
    epsilon?: number;
    [key: string]: any;
}
export declare function setConfig(config: Partial<Config>): void;
export declare function getConfig(): Config;
export declare function getPrecision(): number;
export declare function getEpsilon(): number;
export declare function formatValue(value: number): number;
export declare function isEqual(a: number, b: number): boolean;
export {};
