"use strict";

const HueController = require("./hue-controller");
const Light = require("./light");
const TransitionEnvelope = require("./transition-envelope");


class PheaEngine {

    constructor(options) {
        this._opts = options;
        this._hue = new HueController(options);
        this._envelope = null;
        this._lights = []
        for(let id = 0; id < this._opts.numberOfLights; id++) {
            this._lights.push(new Light(id, this._hue, options));
        }
    }

    start() {
        this._hue.start();
    }

    stop() {
        this._hue.stop();
    }

    transitionColor(transitions) {

        transitions.forEach((transition) => {
            this._lights[transition.lightId].transitionColor(transition.rgb, transition.tweenTime);     
        });
        
    }

    /** Wrapper for async ms sleeping */
    async _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}

module.exports = PheaEngine;
