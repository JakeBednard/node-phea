module.exports = class sin {

    constructor(duration, depth, fps) {
        this._depth = depth/2;
        this._radiansPerStep = (2000 * Math.PI) / (duration * fps);
        this._stepCount = 0;
        this._pixelDelta = 0;
    }

    step() {
        this._pixelDelta = this._depth * Math.sin(this._radiansPerStep * this._stepCount++);
    }

    raster(rgb) {

        rgb[0] = (rgb[0] - this._depth) + this._pixelDelta;
        rgb[1] = (rgb[1] - this._depth) + this._pixelDelta;
        rgb[2] = (rgb[2] - this._depth) + this._pixelDelta;

        let correctedRgb = []
        rgb.forEach((color) => {
            if (color < 0) {
                correctedRgb.push(0);
            }
            else if (color > 255) {
                correctedRgb.push(255);
            }
            else {
                correctedRgb.push(color);
            }
        })

        return correctedRgb;

    }

}
