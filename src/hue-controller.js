"use strict";

const util = require('util');
const Buffer = require('buffer').Buffer;
const log4js = require('@log4js-node/log4js-api');
const dtls = require("node-dtls-client").dtls;
const RequestPromise = require('request-promise-native');


const logger = log4js.getLogger('PHEA');


module.exports = class HueController {

    constructor(lights, options) {
        this._opts = options;
        this._lights = lights;
        this._socket = null;
        this._msgSeqCounter = 0;
    }

    async start() {
        
        try {                
            await this._setHueBridgeDtlsState(true);
            this._socket = await this._openHueBridgeDtlsSocket();
        } catch (error) {
            logger.error('DTLS - Phea failed to establish a connection with the Hue Bridge.');
            throw new Error('PHEA - DTLS - Phea failed to establish a connection with the Hue Bridge.');
        }

        return true;

    }

    async stop() {
        await this._socket.close();
        await this._setHueBridgeDtlsState(false);
    }

    async render(rgb) {
        const message = await this._generateMessage(rgb);
        await this._socket.send(message);
    }

    async _openHueBridgeDtlsSocket() {

        let config = {
            type: "udp4",
            port: this._opts.port,
            address: this._opts.ip,
            psk: {},
            cipherSuites: ['TLS_PSK_WITH_AES_128_GCM_SHA256'],
            timeout: this._opts.socketTimeout
        }

        config.psk[this._opts.username] = Buffer.from(this._opts.psk, 'hex');
    
        let socketCreated = false;

        let socket = await dtls.createSocket(config)
        .on("connected", () => {
            logger.info("DTLS: Socket Established.");
            socketCreated = true;
        })
        .on("error", e => {
            logger.error("DTLS: Socket Setup Failed:", e);
        })
        .on("message", msg => {
            logger.info("DTLS: Message Received:", msg);
        })
        .on("close", () => {
            logger.info("DTLS: Socket Closed.");
        });

        // Await the max timeout of socket creation before
        // checking to see if the socket was successfully
        // created. This is a workaround for no promise avail.

        await new Promise(
            (resolve) => setTimeout(resolve, this._opts.socketTimeout)
        );

        if (!socketCreated) {
            logger.error('DTLS: Socket could not be created.');
            throw new Error('PHEA - DTLS: Socket could not be created.');
        }

        return socket;

    }

    async _setHueBridgeDtlsState(state=true) {

        const setStateQuery = {
            method: 'PUT',
            uri: util.format(
                'http://%s/api/%s/groups/%s', 
                this._opts.ip, this._opts.username, this._opts.group
            ),
            json: true,
            body: {'stream': {'active': state}}
        }

        const responseKey = '/groups/' + this._opts.group + '/stream/active';

        try {

            const response = await RequestPromise(setStateQuery);
            const dtlsState = response[0]['success'][responseKey];
            
            if (state != dtlsState) { throw new Error(); }
            
            logger.info('DTLS: Set Hue Bridge DTLS enabled state:', state);

        } catch (error) {

            logger.error(
                'DTLS: Set Hue Bridge DTLS state failed. State could not' +
                'be set to:', state
            );

            throw new Error(
                'PHEA - DTLS: Set Hue Bridge DTLS state failed. State could not' + 
                'be set to: ' + state
            );

        }

        return true;

    }

   async _generateMessage(rgb) {

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

        return Buffer.from(tempBuffer);

    }

}
