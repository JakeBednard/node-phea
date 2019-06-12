"use strict";

import { Buffer } from 'buffer';
import { dtls } from "node-dtls-client";
import { getLogger } from '@log4js-node/log4js-api';


export default {
    'createSocket': createSocket,
    'createMessage': createMessage
}


const logger = getLogger('PHEA');


async function createSocket(ip, username, psk, timeout, port) {

    let socket = null;

    let config = {
        type: "udp4",
        port: port,
        address: ip,
        psk: {},
        cipherSuites: ['TLS_PSK_WITH_AES_128_GCM_SHA256'],
        timeout: timeout
    }

    config.psk[username] = Buffer.from(psk, 'hex');

    // @ts-ignore
    socket = await dtls.createSocket(config)
    .on("message", (msg) => { 
        logger.info("DTLS: Message received:", msg) 
    })
    .on("error", (e) => { 
        let err = new Error(e);
        err.code = 'PHEA.HUE_DTLS_CONTROLLER.SOCKET_ERROR';
        throw err;
    })
    .on("close", () => {  
        let msg = new Error("PHEA - DTLS: Socket Closed");
        msg.code = 'PHEA.HUE_DTLS_CONTROLLER.SOCKET_CLOSED';
        throw msg;
    });

    await new Promise(
        (resolve) => setTimeout(resolve, this._opts.socketTimeout)
    );

    if (socket == null) {
        logger.error('DTLS: Socket could not be created.');
        let err = new Error('PHEA - DTLS: Socket could not be created.');
        err.code = 'PHEA.HUE_DTLS_CONTROLLER.SOCKET_ERROR'
    }

    return socket;

}

async function createMessage(rgb) {

    // Init temp array with 'HueStream' as bytes for protocol type definition
    const tempBuffer = [0x48, 0x75, 0x65, 0x53, 0x74, 0x72, 0x65, 0x61, 0x6d];
    
    tempBuffer.push(0x01);                              // Major Version
    tempBuffer.push(0x00);                              // Minor Version
    tempBuffer.push(this._msgSeqCounter);               // Sequence Number
    tempBuffer.push(0x00);                              // Reserved
    tempBuffer.push(0x00);                              // Reserved
    tempBuffer.push(0x00);                              // Color Mode RGB
    tempBuffer.push(0x00);                              // Reserved          

    for(let n=0; n<rgb.length; n++) {                   // For each light in group...
        tempBuffer.push(0x00);                          // Light Type Designation
        tempBuffer.push(0x00);                          // Light n ID (16-bit)
        tempBuffer.push(n+1);                           // Offset lightId back to hue api.
        tempBuffer.push(rgb[n][0]);                     // Light n Red (16-bit) 
        tempBuffer.push(rgb[n][0]);                     //  
        tempBuffer.push(rgb[n][1]);                     // Light n Green (16-bit) 
        tempBuffer.push(rgb[n][1]);                     // 
        tempBuffer.push(rgb[n][2]);                     // Light n Blue (16-bit) 
        tempBuffer.push(rgb[n][2]);                     // 
    }

    this._msgSeqCounter = (this._msgSeqCounter + 1) % 256; 

    return await Buffer.from(tempBuffer);

}
