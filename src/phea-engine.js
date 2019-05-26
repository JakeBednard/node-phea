"use strict";

const HueController = require("./hue-controller");
const Light = require("./light");


class PheaEngine {

    constructor(options) {
        this._opts = options;
        this._running = false;
        this._renderLoop = null;
        this._lights = [];
        for(let id=0; id < this._opts.numberOfLights; id++) {
            this._lights.push(new Light(id, options));
        }

        this._hue = new HueController(this._lights, options);

    }

    async start() {
        await this._hue.start();
        this._running = true;
        this._loop();
    }

    async stop() {
        this._running = false;
        clearTimeout(this._renderLoop);
        await this._hue.stop();
    }

    async transition(lightId, rgb, tweenTime) {
        await this._lights[lightId].transitionColor(rgb, tweenTime);
    }

    _loop() {
        if (this._running) {
            this._renderLoop = setTimeout(() => { this._loop(); }, (1000 / this._opts.fps));
            let rgb = this._step();
            this._hue.render(rgb);
        }
    }

    _step() {
        let rgb = [];
        this._lights.forEach((light) => {
            rgb.push(light.gen.next().value);
        });
        // effect
        return rgb;
    }

}

module.exports = PheaEngine;
