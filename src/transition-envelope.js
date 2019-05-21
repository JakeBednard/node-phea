"use strict";


class TransitionEnvelope {

    constructor(lightId, hue, options) {
        this._opts = options;
        this._hue = hue;
        this._lightId = lightId;
        this._transitioning = false;
        this._renderLoop = null;
    }

    stop() {
        this._renderLoop = null;
        this._transitioning = false;
    }

    async transitionColor(tween) {

        this._transitioning = true;
        this._loop(tween);
        
    }

    _loop(tween) {

        if (tween.framesInTransition && this._transitioning) {

            this._hue._lights[this._lightId].red += tween.dr;
            this._hue._lights[this._lightId].green += tween.dg;
            this._hue._lights[this._lightId].blue += tween.db;

        }

        if (--tween.framesInTransition > 0) {
            this._renderLoop = setTimeout(() => { this._loop(tween); }, 1000/this._opts.fps);
        }

    }

}

module.exports = TransitionEnvelope;