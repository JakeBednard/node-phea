"use strict";

const HueController = require("./hue-controller");
const Light = require("./light");


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

    async start() {
        await this._hue.start();
    }

    async stop() {
        await this._hue.stop();
    }

    async transition(transitions) {
        let promises = [];
        transitions.forEach((transition) => {
            promises.push(
                this._hue.lights[transition.lightId].transitionColor(transition.rgb, transition.tweenTime)
            );     
        });
        await Promise.all(promises);
    }

}

module.exports = PheaEngine;
