"use strict";

const PheaEngine = require('./src/phea-engine');

const DEFAULT_PORT = 2100;
const DEFAULT_FPS = 50;
const DEFAULT_MIN_FPS = 10;
const DEFAULT_MAX_FPS = 120;
const DEFAULT_MAX_SOCKET_CONNECT_ATTEMPTS = 5;
const DEFAULT_SOCKET_TIMEOUT_MS = 500;

class Phea {

    constructor(options) {
        this._opts = this._checkInstanceOptions(options);
        this._pheaEngine = new PheaEngine(this._opts);
    }

    start() {
        this._pheaEngine.start();
    }

    stop() {
        this._pheaEngine.stop();
    }

    async transitionColor(lights=[], rgb=[0,0,0], tweenTime=0, block=false) {

        await this._checkTransitionColorOptions(lights, rgb, tweenTime, block);

        if (lights.length == 0) {
            // Make array 1,2,3..numberOfLights
            lights = await Array.from(Array(this._opts.numberOfLights).keys())  
        }

        let transitions = [];
        lights.forEach(function(lightId) {
            transitions.push({
                'lightId': lightId,
                'rgb': rgb,
                'tweenTime': tweenTime
            })
        });

        await this._pheaEngine.transitionColor(transitions);
        
        if (block) {
            await this._sleep(tweenTime);
        }

    }

    _checkTransitionColorOptions(lights, rgb, tweenTime, block) {

        if(!Array.isArray(lights)) {
            throw new Error(
                "PHEA [Transisition]: 'lights' must be an array of ints representing lights to transition."
            );
        }

        lights.forEach(function(lightId) {
            if (!Number.isInteger(lightId)) {
                throw new Error(
                    "PHEA [Transisition]: 'lights' must be an array of ints representing lights to transition."
                ) 
            }
        });

        if (rgb.length != 3) {
            throw new Error(
                "PHEA [Transisition]: 'rgb' must be 3-value int array with ints between [0, 255] inclusive."
            );
        }

        rgb.forEach(function(color) {
            if (color < 0 || color > 255) {
                throw new Error(
                    "PHEA [Transisition]: 'rgb' must be a 3-value int array with ints between [0, 255] inclusive."
                );
            }
        });

        // Validate transitionTime
        if (typeof(tweenTime) !== 'number' || tweenTime < 0) {
            throw new Error("PHEA [Transisition]: 'tweenTime' must be 0 or positive integer.");
        }

        if (block != true && block != false) {
            throw new Error("PHEA [Transisition]: 'block' must be boolean value.");
        }

    }

    _checkInstanceOptions(opts) {

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
        if (opts.numberOfLights < 1 || opts.group > 16) throw new Error(
            "PHEA [Configuration]: 'port' must be between 1 and 16 inclusive."
        );

        if (opts.fps) {
            if (typeof(opts.fps) !== 'number') throw new Error(
                "PHEA [Configuration]: 'fps' must be of type int between " + 
                DEFAULT_MIN_FPS + " and " + DEFAULT_MAX_FPS + " inclusive."
            );
            if (opts.fps < DEFAULT_MIN_FPS || opts.fps > DEFAULT_MAX_FPS)  throw new Error(
                "PHEA [Configuration]: 'fps' must be between " + DEFAULT_MIN_FPS + 
                " and " + DEFAULT_MAX_FPS + " inclusive."
            );
        }
        else {
            opts.fps = DEFAULT_FPS;
        }

        return {
            "ip": opts.ip,
            "port": opts.port,
            "username": opts.username,
            "psk": opts.psk,
            "group": opts.group,
            "numberOfLights": opts.numberOfLights,
            "fps": opts.fps,
            "maxSocketConnectAttempts": DEFAULT_MAX_SOCKET_CONNECT_ATTEMPTS,
            "socketTimeout": DEFAULT_SOCKET_TIMEOUT_MS
        };

    }

    /** Wrapper for async ms sleeping */
    async _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}

module.exports = Phea;
