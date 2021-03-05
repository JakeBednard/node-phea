/// <reference types="node" />
import { dtls } from "node-dtls-client";
import { LightState } from "./phea-light-state";
export declare namespace HueDtls {
    function createSocket(address: string, username: string, psk: string, timeout: number, port: number, listenPort: number): Promise<dtls.Socket>;
    function createMessage(lights: LightState[]): Buffer;
}
