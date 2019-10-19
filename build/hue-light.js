"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            let sample = [this.rgb[0], this.rgb[1], this.rgb[2]];
            yield sample;
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