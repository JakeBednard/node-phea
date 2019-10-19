import { Options } from "./phea-options";
import { HueBridge } from "./hue-bridge";
export declare function discover(): Promise<any>;
export declare function register(ipAddress: string): Promise<any>;
export declare function bridge(options: Options): Promise<HueBridge>;
export declare function configureBridgeOptions(options: Options): void;
