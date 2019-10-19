import { Options } from "./phea-options";
import { HueBridge } from "./hue-bridge";
export declare namespace Phea {
    function discover(): Promise<any>;
    function register(ipAddress: string): Promise<any>;
    function bridge(options: Options): Promise<HueBridge>;
    function configureBridgeOptions(options: Options): void;
}
