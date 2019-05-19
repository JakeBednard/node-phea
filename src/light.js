"use strict";

const TransitionEnvelope = require("./transition-envelope");


class Light {

    constructor(id, hue, options) {
        this._id = id;
        this._opts = options;
        this._hue = hue;
        this._envelope = null;
    }

    async transitionColor(rgb, tweenTime) {

        let tween = await this._calculateTween(rgb, tweenTime);

        if (this._envelope != null) {
            await this._envelope.stop();
            this._envelope = null;
        }

        let envelope = await new TransitionEnvelope(this._id, this._hue, this._opts);
        envelope.transitionColor(tween);

        this._envelope = envelope; 

    }

    _calculateTween(rgb, tweenTime) {

        let singleFrameMs = (1000 / this._opts.fps);
        tweenTime = (tweenTime > singleFrameMs) ? tweenTime : singleFrameMs;

        let framesInTransition = Math.floor(tweenTime / singleFrameMs);
       
        let dr = (rgb[0] - this._hue._lights[this._id].red) / framesInTransition;
        let dg = (rgb[1] - this._hue._lights[this._id].green) / framesInTransition;
        let db = (rgb[2] - this._hue._lights[this._id].blue) / framesInTransition;

        return {
            'dr': dr,
            'dg': dg,
            'db': db,
            'framesInTransition': framesInTransition
        };

    }

    /** Wrapper for async ms sleeping */
    async _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}

module.exports = Light;
