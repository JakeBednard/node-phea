"use strict";


class TransitionEnvelope {

    constructor(lightId, hue, options) {
        this._opts = options;
        this._hue = hue;
        this._lightId = lightId;
        this._transitioning = false;
    }

    stop() {
        this._transitioning = false;
    }

    async transitionColor(tween) {

        this._transitioning = true;

        let i = 0;
        while(i < tween.framesInTransition && this._transitioning) {

            this._hue._lights[this._lightId].red += tween.dr;
            this._hue._lights[this._lightId].green += tween.dg;
            this._hue._lights[this._lightId].blue += tween.db;

            i++;

            await this._sleep(1000/this._opts.fps);

        }

    }

    /** Wrapper for async ms sleeping */
    async _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}

module.exports = TransitionEnvelope;