"use strict";


class Light {

    constructor(id, options) {
        this.id = id;
        this._opts = options;
        this._rgb = [0,0,0];
        this.textures = [];
        this.gen = null;
        this.transitionColor([0,0,0], 0); // Setup generator;
    }

    async transitionColor(rgb, tweenTime) {
        this.gen = await this._setTransition(rgb, tweenTime);
    }

    * _setTransition(rgb, tweenTime) {

        let tween = this._calculateTween(rgb, tweenTime);

        while(true) {
        
            if (tween.frames-- > 0) {
                this._rgb[0] += tween.dr;
                this._rgb[1] += tween.dg;
                this._rgb[2] += tween.db;   
            }

            let sample = [this._rgb[0], this._rgb[1], this._rgb[2]]
            this.textures.forEach(texture => {
                sample = texture.raster(sample);
            });
            console.log('sample', sample);

            yield sample;
        
        }

    }

    _calculateTween(rgb, tweenTime) {

        let singleFrameMs = (1000 / this._opts.fps);
        tweenTime = (tweenTime > singleFrameMs) ? tweenTime : singleFrameMs;

        let framesInTransition = Math.floor(tweenTime / singleFrameMs);
       
        let dr = (rgb[0] - this._rgb[0]) / framesInTransition;
        let dg = (rgb[1] - this._rgb[1]) / framesInTransition;
        let db = (rgb[2] - this._rgb[2]) / framesInTransition;

        return {
            'dr': dr,
            'dg': dg,
            'db': db,
            'frames': framesInTransition
        };

    }
    
}

module.exports = Light;
