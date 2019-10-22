/// <reference types="node" />
import { LightState } from "./phea-light-state";
export declare namespace HueDtls {
    function createSocket(address: string, username: string, psk: string, timeout: number, port: number): Promise<any>;
    function createMessage(lights: LightState[]): Buffer;
}
