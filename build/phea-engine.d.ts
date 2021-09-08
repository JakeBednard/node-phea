import { Options } from "./phea-options";
import { dtls } from "node-dtls-client";
export declare class PheaEngine {
    opts: Options;
    running: boolean;
    private colorRenderLoop;
    private dtlsUpdateLoop;
    private socket;
    private lights;
    private groupId;
    constructor(options: Options);
    start(groupIdStr: string): Promise<dtls.Socket>;
    stop(): void;
    transition(lightId: string | number, rgb: number[], tweenTime: number): Promise<void>;
    private stepColor;
    private dtlsUpdate;
    private _setupLights;
}
