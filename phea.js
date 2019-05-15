"use strict";

const util = require('util');
const Buffer = require('buffer').Buffer;
const request = require('request');
const dtls = require("node-dtls-client").dtls;

const DEFAULT_PORT = 2100;
const DEFAULT_FPS = 50;
const DEFAULT_MIN_FPS = 10;
const DEFAULT_MAX_FPS = 60;
const DEFAULT_MAX_SOCKET_CONNECT_ATTEMPTS = 5;

 class Phea {

    /**
     * Create controller for Philips Hue Entertainment API. 
     */
    constructor(options) {
        this._opts = this._checkOptions(options);
        this._running = false;
        this._socket = null;
        this.red = 0;
        this.green = 0;
        this.blue = 0;
    }

    /**
     * Start streaming to Hue Entertainment API.
     */
    async start() {
        await this._setHueBridgeDtlsState(true);
        await this._openHueBridgeDtlsSocket();
        this._loop();
    }

    /**
     * Stop streaming to Hue Entertainment API.
     */
    stop() {
        this._running = false;
        this._socket.close();
        this._socket = null;
        this._setHueBridgeDtlsState(false);
    }

    /**
     * Looping structure for rendering colors to Entertainment API.
     */
    async _loop() {

        let sequence_number = 0;
        while(this._running) {

            let message = this._generateMessage(sequence_number);

            await this._socket.send(message);

            sequence_number = (sequence_number + 1) % 256 
            
            await this._sleep(1000 / this._opts.fps);
            
        }

    }

    /**
     * Enable/Disable DTLS streaming mode on Hue Bridge.
     */
    async _setHueBridgeDtlsState(state=true) {

        const request_options = {
            url: util.format('http://%s/api/%s/groups/%s', this._opts.ip, this._opts.username, this._opts.group),
            method: 'PUT',
            json: true,
            body: {'stream': {'active': state}}
        };

        await request.put(request_options, function(error, response, body) {
            if (body[0].success == null) {
                throw new Error("PHEA [DTLS]: Could not access Hue bridge");
            }
            else {
                console.log("PHEA [DTLS]: Hue bridge DTLS enabled: " + state);
            } 
        });

        await this._sleep(100);

    }

    /**
     * Establish DTLS socket with Hue Bridge
     */
    async _openHueBridgeDtlsSocket() {

        let config = {
            type: 'udp4',
            port: this._opts.port,
            address: this._opts.ip,
            psk: {},
            cipherSuites: ['TLS_PSK_WITH_AES_128_GCM_SHA256'],
            timeout: 400
        }

        config.psk[this._opts.username] = this._opts.psk;

        let maxAttempts = DEFAULT_MAX_SOCKET_CONNECT_ATTEMPTS;
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
                console.log("PHEA [DTLS]: Socket Received: ", msg);
            })
            .on("close", e => {
                console.log("PHEA [DTLS]: Socket Closed");
            });

            await this._sleep(500);

        }

        if (maxAttempts < 0) {
            throw new Error("PHEA [DTLS]: Could not establish socket with Hue Bridge.");
        } 

    }

    /**
     * Returns formatted Hue Entertainment API Message Buffer
     */
    _generateMessage(sequence_number=0) {

        // Init temp array with 'HueStream' as bytes for protocol type definition
        const tempBuffer = [0x48, 0x75, 0x65, 0x53, 0x74, 0x72, 0x65, 0x61, 0x6d];
        
        tempBuffer.push(0x01);                              // Major Version
        tempBuffer.push(0x00);                              // Minor Version
        tempBuffer.push(sequence_number);                   // Sequence Number
        tempBuffer.push(0x00);                              // Reserved
        tempBuffer.push(0x00);                              // Reserved
        tempBuffer.push(0x00);                              // Color Mode RGB
        tempBuffer.push(0x00);                              // Reserved

        let rgb = this._checkColors();                      // Get a latest color setting in checked array.

        for(let n=1; n<=this._opts.numberOfLights; n++) {    // For each light in group...
            tempBuffer.push(0x00);                          // Light Type Designation
            tempBuffer.push(0x00);                          // Light n ID (16-bit)
            tempBuffer.push(n);                             // 
            tempBuffer.push(rgb[0]);                        // Light n Red (16-bit) 
            tempBuffer.push(rgb[0]);                        //  
            tempBuffer.push(rgb[1]);                        // Light n Green (16-bit) 
            tempBuffer.push(rgb[1]);                        // 
            tempBuffer.push(rgb[2]);                        // Light n Blue (16-bit) 
            tempBuffer.push(rgb[2]);                        // 
        }

        return Buffer.from(tempBuffer);

    }

    /**
     * Checks, prepares, returns color state;
     * Returns [r,g,b] array of current color state;
     */
    _checkColors() {

        if (typeof(this.red) !== 'number' || typeof(this.green) !== 'number' || typeof(this.blue) !== 'number') throw new Error (
            "Phea [Colors]: Colors must be of type int."
        );

        return [Math.abs(this.red % 256), Math.abs(this.green % 256), Math.abs(this.green % 256)];

    }

    /**
     * Checks, prepare, and return configuration options;
     * Returns dict of options;
     */
    _checkOptions(opts) {

        if (opts == null) throw new Error("PHEA [Configuration]: No configuration dictionary given. See documented examples.");

        if (typeof(opts.ip) !== 'string') throw new Error(
            "PHEA [Configuration]: 'ip' type invalid or unspecified. Must be string containing IP in IPv4 format."
        );

        let ipRegex = new RegExp(
            "^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\." + 
            "(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\." + 
            "(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\." + 
            "(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
        );

        if (!ipRegex.test(opts.ip)) throw new Error(
            "PHEA [Configuration]: 'ip' format invalid. Must be string containing IP in IPv4 format."
        );

        if (opts.port) {
            if (typeof(opts.port) !== 'number') throw new Error(
                "PHEA [Configuration]: 'port' must be of type int between 0 and 65555 inclusive."
            );
            if (opts.port < 0 || opts.port > 65343)  throw new Error(
                "PHEA [Configuration]: 'port' must be of type int between 0 and 65555 inclusive."
            );
        }
        else {
            opts.port = DEFAULT_PORT;
        }

        if (typeof(opts.username) !== 'string') throw new Error(
            "PHEA [Configuration]: 'username' type invalid or unspecified. Must be string."
        );

        if (typeof(opts.psk) !== 'string') throw new Error(
            "PHEA [Configuration]: 'psk' type invalid or unspecified. Must be string."
        );

        if (typeof(opts.group) !== 'number') throw new Error(
            "PHEA [Configuration]: 'group' must be of type int between 0 and 255 inclusive."
        )
        ;
        if (opts.group < 0 || opts.group > 255)  throw new Error(
            "PHEA [Configuration]: 'port' must be between 0 and 255 inclusive."
        );

        if (typeof(opts.numberOfLights) !== 'number') throw new Error(
            "PHEA [Configuration]: 'numberOfLights' must be of type int between 0 and 16 inclusive."
        )
        ;
        if (opts.numberOfLights < 1 || opts.group > 16)  throw new Error(
            "PHEA [Configuration]: 'port' must be between 1 and 16 inclusive."
        );

        if (opts.fps) {
            if (typeof(opts.fps) !== 'number') throw new Error(
                "PHEA [Configuration]: 'fps' must be of type int between" + 
                DEFAULT_MIN_FPS + "and" + DEFAULT_MAX_FPS + "inclusive."
            );
            if (opts.fps < DEFAULT_MIN_FPS || opts.fps > DEFAULT_MAX_FPS)  throw new Error(
                "PHEA [Configuration]: 'fps' must be between" + DEFAULT_MIN_FPS + "and" + DEFAULT_MAX_FPS + "inclusive."
            );
        }
        else {
            opts.fps = DEFAULT_FPS;
        }

        return {
            "ip": opts.ip,
            "port": opts.port,
            "username": opts.username,
            "psk": Buffer.from(opts.psk, 'hex'),
            "group": opts.group,
            "numberOfLights": opts.numberOfLights,
            "fps": opts.fps  
        };

    }

    /** Wrapper for async ms sleeping */
    async _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}

module.exports = Phea;
