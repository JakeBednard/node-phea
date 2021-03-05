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
exports.HueBridge = void 0;
const hue_http_1 = require("./hue-http");
const phea_engine_1 = require("./phea-engine");
class HueBridge {
    constructor(options) {
        this.opts = options;
        this.pheaEngine = null;
    }
    register() {
        return __awaiter(this, void 0, void 0, function* () {
            let credentials = yield hue_http_1.HueHttp.registration(this.opts.address);
            return credentials;
        });
    }
    getGroup(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            let group;
            if (!Number.isInteger(Number(groupId))) {
                throw new Error("groupId must be int | string [0,16] inclusive.");
            }
            else if (Number(groupId) < 0 || Number(groupId) > 16) {
                throw new Error("groupId must be int | string [0,16] inclusive.");
            }
            group = yield hue_http_1.HueHttp.getGroup(this.opts.address, this.opts.username, groupId);
            return group;
        });
    }
    start(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Number.isInteger(Number(groupId))) {
                throw new Error("GroupId must be in integer [0,31] inclusive as type string or empty string.");
            }
            else if (Number(groupId) < 0 || Number(groupId) > 31) {
                throw new Error("GroupId must be in integer [0,31] inclusive as type string or empty string.");
            }
            if (this.pheaEngine == null) {
                this.pheaEngine = new phea_engine_1.PheaEngine(this.opts);
                yield this.pheaEngine.start(groupId);
            }
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.pheaEngine && this.pheaEngine.running) {
                yield this.pheaEngine.stop();
                this.pheaEngine = null;
            }
        });
    }
    transition(lightId, rgb, tweenTime = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Array.isArray(lightId)) {
                lightId = [lightId];
            }
            rgb.forEach((color) => {
                if (!Number.isInteger(color)) {
                    throw new Error("rgb[] must be array of int[0,255] inclusive.");
                }
                else if (color < 0 || color > 255) {
                    throw new Error("rgb[] must be array of int[0,255] inclusive.");
                }
            });
            if (!Number.isInteger(tweenTime)) {
                throw new Error("tweenTime must be postive integer or 0.");
            }
            else if (tweenTime < 0) {
                throw new Error("rgb[] must be array of int[0,255] inclusive.");
            }
            lightId.forEach((id) => {
                if (!Number.isInteger(Number(id))) {
                    throw new Error("lightId | lightId[] must be int[0,31] inclusive as type string.");
                }
                else if (Number(id) < 0 || Number(id) > 16) {
                    throw new Error("lightId | lightId[] must be int[0,31] inclusive as type string.");
                }
                if (this.pheaEngine != null && this.pheaEngine.running) {
                    this.pheaEngine.transition(id, rgb, tweenTime);
                }
            });
        });
    }
}
exports.HueBridge = HueBridge;
//# sourceMappingURL=../src/build/hue-bridge.js.map