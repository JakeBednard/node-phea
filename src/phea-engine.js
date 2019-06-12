"use strict";

const HueApi = require("./hue-api-controller");
const HueDtls = require("./hue-dtls").default;
const Light = require("./hue-light");


module.export = class PheaEngine {

    constructor(ipAddress, entertainmentGroup, username, psk, fps) {
        this.opts = options;
        this._running = false;
        this._renderLoop = null;
        this._hue = new HueDtls(this._lights, options);
        this._lights = [];
    }

    async init() {

    }

    async start() {
        await HueApi.enableEntertainmentMode(true, ipAddress, username, group);
        this._socket = await HueDtls.socket(ip, username, psk, timeout, port);
        this._running = true;
        this._loop();
        return true;
    }

    async stop() {
        this._running = false;
        clearTimeout(this._renderLoop);
        await this._hue.stop();
        await this._socket.close();
        await this._setHueBridgeDtlsState(false);
    }

    async transition(lightId, rgb, tweenTime) {
        await this._lights[lightId].transitionColor(rgb, tweenTime);
        const message = await this._generateMessage(rgb);
        await this._socket.send(message);
    }

    async _loop() {

        if (this._running) {

            this._renderLoop = setTimeout(() => { this._loop(); }, (1000 / this._opts.fps));
            
            let rgb = [];
            await this._lights.forEach((light) => {
                rgb.push(light.gen.next().value);
            });
            
            await this._hue.render(rgb);

        }

    }

}
