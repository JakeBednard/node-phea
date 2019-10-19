/// <reference types="node" />
export declare namespace HueDtls {
    function createSocket(address: string, username: string, psk: string, timeout: number, port: number): Promise<any>;
    function createMessage(rgb: number[][]): Buffer;
}
