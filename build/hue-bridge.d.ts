import { PheaEngine } from "./phea-engine";
import { Options } from "./phea-options";
export declare class HueBridge {
    opts: Options;
    pheaEngine: PheaEngine | null;
    constructor(options: Options);
    register(): Promise<any>;
    getGroup(groupId: string | number): Promise<any>;
    start(groupId: string): Promise<void>;
    stop(): Promise<void>;
    transition(lightId: (string | number)[], rgb: number[], tweenTime?: number): Promise<void>;
}
