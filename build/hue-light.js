"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HueLight = void 0;
class HueLight {
    constructor(id, options) {
        this.id = id;
        this.opts = options;
        this.rgb = [0, 0, 0];
        this.gen = null;
        this.transitionColor([0, 0, 0], 0);
    }
    transitionColor(rgb, tweenTime) {
        this.gen = this.setTransition(rgb, tweenTime);
    }
    sampleColor() {
        let sample = [
            Math.floor(this.rgb[0]),
            Math.floor(this.rgb[1]),
            Math.floor(this.rgb[2])
        ];
        for (let i = 0; i < 3; i++) {
            if (sample[i] < 0) {
                sample[i] = 0;
            }
            else if (sample[i] > 255) {
                sample[i] = 255;
            }
        }
        return {
            lightId: this.id,
            color: sample
        };
    }
    step() {
        this.gen.next();
    }
    *setTransition(rgb, tweenTime) {
        let tween = this.calculateTween(rgb, tweenTime);
        while (true) {
            if (tween.frames-- > 0) {
                this.rgb[0] += tween.dr;
                this.rgb[1] += tween.dg;
                this.rgb[2] += tween.db;
            }
            yield;
        }
    }
    calculateTween(rgb, tweenTime) {
        let singleFrameMs = (1000 / this.opts.colorUpdatesPerSecond);
        tweenTime = (tweenTime > singleFrameMs) ? tweenTime : singleFrameMs;
        let framesInTransition = Math.floor(tweenTime / singleFrameMs);
        let dr = (rgb[0] - this.rgb[0]) / framesInTransition;
        let dg = (rgb[1] - this.rgb[1]) / framesInTransition;
        let db = (rgb[2] - this.rgb[2]) / framesInTransition;
        return {
            'dr': dr,
            'dg': dg,
            'db': db,
            'frames': framesInTransition
        };
    }
}
exports.HueLight = HueLight;
//# sourceMappingURL=../src/build/hue-light.js.map