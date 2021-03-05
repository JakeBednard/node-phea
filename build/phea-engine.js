"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PheaEngine = void 0;
const hue_http_1 = require("./hue-http");
const hue_dtls_1 = require("./hue-dtls");
const hue_light_1 = require("./hue-light");
class PheaEngine {
    constructor(options) {
        this.opts = options;
        this.running = false;
        this.colorRenderLoop = null;
        this.dtlsUpdateLoop = null;
        this.socket = null;
        this.lights = [];
        this.groupId = "-1";
    }
    start(groupIdStr) {
        return __awaiter(this, void 0, void 0, function* () {
            let group = yield hue_http_1.HueHttp.getGroup(this.opts.address, this.opts.username, groupIdStr);
            if (!group.type || group.type != 'Entertainment') {
                throw new Error("Current group selected does not exist or is not a valid Entertainment group.");
            }
            this.groupId = groupIdStr;
            yield this._setupLights(group.lights);
            yield hue_http_1.HueHttp.setEntertainmentMode(true, this.opts.address, this.opts.username, this.groupId);
            this.socket = yield hue_dtls_1.HueDtls.createSocket(this.opts.address, this.opts.username, this.opts.psk, this.opts.dtlsTimeoutMs, this.opts.dtlsPort, this.opts.dtlsListenPort);
            this.running = true;
            this.colorRenderLoop = setInterval(() => { this.stepColor(); }, (1000 / this.opts.colorUpdatesPerSecond));
            this.dtlsUpdateLoop = setInterval(() => { this.dtlsUpdate(); }, (1000 / this.opts.dtlsUpdatesPerSecond));
        });
    }
    stop() {
        this.running = false;
        clearInterval(this.colorRenderLoop);
        clearInterval(this.dtlsUpdateLoop);
        if (this.socket != null) {
            this.socket.close();
        }
        hue_http_1.HueHttp.setEntertainmentMode(false, this.opts.address, this.opts.username, this.groupId);
        this.groupId = "-1";
    }
    transition(lightId, rgb, tweenTime) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Number(lightId) === 0) {
                this.lights.forEach((light) => {
                    light.transitionColor(rgb, tweenTime);
                });
            }
            else {
                this.lights[Number(lightId) - 1].transitionColor(rgb, tweenTime);
            }
        });
    }
    stepColor() {
        if (!this.running)
            return;
        this.lights.forEach(light => light.step());
    }
    dtlsUpdate() {
        if (!this.running || this.socket == null) {
            return;
        }
        let lights = [];
        this.lights.forEach((light) => {
            lights.push(light.sampleColor());
        });
        let msg = hue_dtls_1.HueDtls.createMessage(lights);
        this.socket.send(msg);
    }
    _setupLights(lightIDs) {
        this.lights = [];
        lightIDs.forEach(lightId => {
            this.lights.push(new hue_light_1.HueLight(lightId.toString(), this.opts));
        });
    }
}
exports.PheaEngine = PheaEngine;
//# sourceMappingURL=../src/build/phea-engine.js.map