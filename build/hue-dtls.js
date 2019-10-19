"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_1 = require("buffer");
const node_dtls_client_1 = require("node-dtls-client");
var HueDtls;
(function (HueDtls) {
    function createSocket(address, username, psk, timeout, port) {
        return __awaiter(this, void 0, void 0, function* () {
            let socket = null;
            let config = {
                type: "udp4",
                port: port,
                address: address,
                psk: { [username]: buffer_1.Buffer.from(psk, 'hex') },
                cipherSuites: ['TLS_PSK_WITH_AES_128_GCM_SHA256'],
                timeout: timeout
            };
            socket = yield node_dtls_client_1.dtls.createSocket(config)
                .on("message", (msg) => {
            })
                .on("error", (e) => {
                let err = new Error(e);
                throw err;
            })
                .on("close", () => {
            });
            yield new Promise((resolve) => setTimeout(resolve, 500));
            if (socket == null) {
                let err = new Error('PHEA - DTLS: Socket could not be created.');
            }
            return socket;
        });
    }
    HueDtls.createSocket = createSocket;
    function createMessage(rgb) {
        const tempBuffer = [0x48, 0x75, 0x65, 0x53, 0x74, 0x72, 0x65, 0x61, 0x6d];
        tempBuffer.push(0x01);
        tempBuffer.push(0x00);
        tempBuffer.push(0x00);
        tempBuffer.push(0x00);
        tempBuffer.push(0x00);
        tempBuffer.push(0x00);
        tempBuffer.push(0x00);
        for (let n = 0; n < rgb.length; n++) {
            tempBuffer.push(0x00);
            tempBuffer.push(0x00);
            tempBuffer.push(n + 1);
            tempBuffer.push(Math.round(rgb[n][0]));
            tempBuffer.push(Math.round(rgb[n][0]));
            tempBuffer.push(Math.round(rgb[n][1]));
            tempBuffer.push(Math.round(rgb[n][1]));
            tempBuffer.push(Math.round(rgb[n][2]));
            tempBuffer.push(Math.round(rgb[n][2]));
        }
        return buffer_1.Buffer.from(tempBuffer);
    }
    HueDtls.createMessage = createMessage;
})(HueDtls = exports.HueDtls || (exports.HueDtls = {}));
//# sourceMappingURL=../src/build/hue-dtls.js.map