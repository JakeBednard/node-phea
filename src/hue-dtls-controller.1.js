"use strict";

const util = require('util');
const Buffer = require('buffer').Buffer;
const log4js = require('@log4js-node/log4js-api');
const RequestPromise = require('request-promise-native');
const dtls = require("node-dtls-client").dtls;


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

            const perfStart = process.hrtime();

            await this._setHueBridgeDtlsState(true);
            await this._openHueBridgeDtlsSocket();

            const perfStop = process.hrtime(perfStart);
            logger.trace('DTLS: Hue Bridge connection initialization completed in %dms', (perfStop[1] + (1000000000 * perfStop[0])) / 1000000);
            logger.debug('DTLS: Socket Ready');

        } catch (error) {

            switch(error.code) {
                case 'PHEA.HUE_DTLS_CONTROLLER.SET_BRDIGE_STATE_FAILURE':
                    break;
                case 'PHEA.HUE_DTLS_CONTROLLER.SOCKET_CLOSED':
                    logger.debug("DTLS: Socket closed."); 
                    this._socket = null;
                    break;
                case 'PHEA.HUE_DTLS_CONTROLLER.SOCKET_ERROR':
                    logger.error("DTLS: Socket Error: ", error); 
                    this._socket = null;
                    break;
                default:
                    break;
            }

        }

        return true;

    }

    async stop() {

        const perfStart = process.hrtime();

        try {
        
            await this._socket.close();
            await this._setHueBridgeDtlsState(false);
        
        } catch (error) {

            switch(error.code) {
                case 'PHEA.HUE_CONTROLLER.DTLS_STATE_SET_FAILURE':
                default:
                    throw error;
            }

        }

        const perfStop = process.hrtime(perfStart);
        logger.trace('DTLS: Hue Bridge connection destroyed in %ds %dms', perfStop[0], perfStop[1] / 1000000);

    }

    async render(rgb) {

        const message = await this._generateMessage(rgb);
        await this._socket.send(message);

    }

    async _setHueBridgeDtlsState(state=true) {

        try {
            
            const setStateQuery = {
                method: 'PUT',
                uri: util.format(
                    'http://%s/api/%s/groups/%s', 
                    this._opts.ip, this._opts.username, this._opts.group
                ),
                json: true,
                body: {'stream': {'active': state}}
            }

            const response = await RequestPromise(setStateQuery);
            const responseKey = '/groups/' + this._opts.group + '/stream/active';
            const dtlsState = response[0]['success'][responseKey];
            if (state != dtlsState) throw new Error("PHEA: Hue Bridge DTLS State could not be set.");

        } catch (error) {

            error.code = 'PHEA.HUE_DTLS_CONTROLLER.SET_BRDIGE_STATE_FAILURE'; 
            throw Error(error);

        }

    }

    async _openHueBridgeDtlsSocket() {

        let socket = null;

        let config = {
            type: "udp4",
            port: this._opts.port,
            address: this._opts.ip,
            psk: {},
            cipherSuites: ['TLS_PSK_WITH_AES_128_GCM_SHA256'],
            timeout: this._opts.socketTimeout
        }

        config.psk[this._opts.username] = Buffer.from(this._opts.psk, 'hex');

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

        this._socket = socket;

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

        return await Buffer.from(tempBuffer);

    }

}
