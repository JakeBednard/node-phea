"use strict";

import { Buffer } from 'buffer';
import { dtls } from "node-dtls-client";
import { getLogger } from '@log4js-node/log4js-api';

const logger = getLogger('PHEA');


export namespace HueDtls {

    export async function createSocket(address: string, username: string, psk: string, timeout: number, port: number) {

        let socket = null;

        let config = {
            type: "udp4",
            port: port,
            address: address,
            psk: { [username]: Buffer.from(psk, 'hex') },
            cipherSuites: ['TLS_PSK_WITH_AES_128_GCM_SHA256'],
            timeout: timeout
        }

        // @ts-ignore
        socket = await dtls.createSocket(config)
        .on("message", (msg: string) => { 
            logger.info("DTLS: Message received:", msg) 
        })
        .on("error", (e: any) => { 
            let err = new Error(e);
            //err.code = 'PHEA.HUE_DTLS_CONTROLLER.SOCKET_ERROR';
            throw err;
        })
        .on("close", () => {  
            //let msg = new Error("PHEA - DTLS: Socket Closed");
            //msg.code = 'PHEA.HUE_DTLS_CONTROLLER.SOCKET_CLOSED';
            //throw msg;
            // I can't remember. I want to say at some point that "close" get's called
            // on error by dtls-socket. This caused the code to continue to run,
            // even after a failed startup. By throwing here, I was able to avoid
            // this condition. If this is still true, the fix will need to look
            // at state of the socket to determine if it is open.

        });

        await new Promise(
            (resolve) => setTimeout(resolve, 500)
        );

        if (socket == null) {
            logger.error('DTLS: Socket could not be created.');
            let err = new Error('PHEA - DTLS: Socket could not be created.');
            //err.code = 'PHEA.HUE_DTLS_CONTROLLER.SOCKET_ERROR'
        }

        return socket;

    }

    export function createMessage(rgb: number[][]): Buffer {

        // Init temp array with 'HueStream' as bytes for protocol type definition
        const tempBuffer = [0x48, 0x75, 0x65, 0x53, 0x74, 0x72, 0x65, 0x61, 0x6d];
        
        tempBuffer.push(0x01);                              // Major Version
        tempBuffer.push(0x00);                              // Minor Version
        tempBuffer.push(0x00);                              // Sequence Number
        tempBuffer.push(0x00);                              // Reserved
        tempBuffer.push(0x00);                              // Reserved
        tempBuffer.push(0x00);                              // Color Mode RGB
        tempBuffer.push(0x00);                              // Reserved          

        for(let n=0; n<rgb.length; n++) {                   // For each light in group...
            tempBuffer.push(0x00);                          // Light Type Designation
            tempBuffer.push(0x00);                          // Light n ID (16-bit)
            tempBuffer.push(n+1);                           // Offset lightId back to hue api.
            tempBuffer.push(Math.round(rgb[n][0]));                     // Light n Red (16-bit) 
            tempBuffer.push(Math.round(rgb[n][0]));                     //  
            tempBuffer.push(Math.round(rgb[n][1]));                     // Light n Green (16-bit) 
            tempBuffer.push(Math.round(rgb[n][1]));                     // 
            tempBuffer.push(Math.round(rgb[n][2]));                     // Light n Blue (16-bit) 
            tempBuffer.push(Math.round(rgb[n][2]));                     // 
        }

        return Buffer.from(tempBuffer);

    }

}
