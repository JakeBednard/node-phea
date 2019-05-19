"use strict";

const util = require('util');
const Buffer = require('buffer').Buffer;
const Request = require('request');
const dtls = require("node-dtls-client").dtls;


 class HueController {

    constructor(options) {
        
        this._opts = options;
        this._running = false;
        this._socket = null;
        this._renderLoop = null;
        this._msgSeqCounter = 0;
        
        this._lights = [];
        for(let id=0; id < this._opts.numberOfLights; id++) {
            this._lights.push(
                {red: 0, green: 0, blue: 0}
            )
        }

    }

    async start() {
        await this._openHueBridgeDtlsSocket();
        this._renderLoop = setInterval(() => {  
            const message = this._generateMessage();
            this._socket.send(message);
        }, (1000/this._opts.fps));
    }

    stop() {
        clearInterval(this._renderLoop);
        this._closeHueBridgeDtlsSocket();
    }

    async _openHueBridgeDtlsSocket() {

        let config = {
            type: 'udp4',
            port: this._opts.port,
            address: this._opts.ip,
            psk: {},
            cipherSuites: ['TLS_PSK_WITH_AES_128_GCM_SHA256'],
            timeout: this._opts.socketTimeout
        }

        config.psk[this._opts.username] = Buffer.from(this._opts.psk, 'hex');

        await this._setHueBridgeDtlsState(true);

        let maxAttempts = this._opts.maxSocketConnectAttempts;

        while(!this._running && maxAttempts-- >= 0) {
            
            this._socket = await dtls.createSocket(config)
            .on("connected", () => {
                console.log("PHEA [DTLS]: Socket Established");
                this._running = true;
            })
            .on("error", e => {
                console.log("PHEA [DTLS]: Socket Failed: Retrying...");
            })
            .on("message", msg => {
                // I don't expect to receive messages, but if aliens:
                console.log("PHEA [DTLS]: Socket Received: ", msg);
            })
            .on("close", e => {
                this._socket = null;
                this._running = false;
                console.log("PHEA [DTLS]: Socket Closed");
            });

            await this._sleep(this._opts.socketTimeout + 10);

        }

        if (maxAttempts < 0) {
            throw new Error("PHEA [DTLS]: Could not establish socket with Hue Bridge.");
        } 

    }

    _closeHueBridgeDtlsSocket() {
        this._socket.close();
        this._setHueBridgeDtlsState(false);
    }

    async _setHueBridgeDtlsState(state=true) {

        const request_options = {
            url: util.format('http://%s/api/%s/groups/%s', this._opts.ip, this._opts.username, this._opts.group),
            method: 'PUT',
            json: true,
            body: {'stream': {'active': state}}
        };

        await Request.put(request_options, function(error, response, body) {
            if (body[0].success == null) {
                throw new Error("PHEA [DTLS]: Could not access Hue bridge.");
            }
            else {
                console.log("PHEA [DTLS]: Hue bridge DTLS enabled: " + state);
            } 
        });

        // Allow bridge to stablize Dtls state before proceeding.
        await this._sleep(100);

    }

    _generateMessage() {

        // Sample current color values.
        const rgb = [];

        for(let id=0; id<this._opts.numberOfLights; id++) {
            rgb.push([
                Math.abs(Math.floor(this._lights[id].red)) % 256, 
                Math.abs(Math.floor(this._lights[id].green)) % 256, 
                Math.abs(Math.floor(this._lights[id].blue)) % 256
            ]);
        }
           

        // Init temp array with 'HueStream' as bytes for protocol type definition
        const tempBuffer = [0x48, 0x75, 0x65, 0x53, 0x74, 0x72, 0x65, 0x61, 0x6d];
        
        tempBuffer.push(0x01);                              // Major Version
        tempBuffer.push(0x00);                              // Minor Version
        tempBuffer.push(this._msgSeqCounter);               // Sequence Number
        tempBuffer.push(0x00);                              // Reserved
        tempBuffer.push(0x00);                              // Reserved
        tempBuffer.push(0x00);                              // Color Mode RGB
        tempBuffer.push(0x00);                              // Reserved          

        for(let n=0; n<this._opts.numberOfLights; n++) {    // For each light in group...
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

    async _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}

module.exports = HueController;
