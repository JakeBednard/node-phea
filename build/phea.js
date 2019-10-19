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
const log4js_api_1 = require("@log4js-node/log4js-api");
const hue_bridge_1 = require("./hue-bridge");
const hue_http_1 = require("./hue-http");
const phea_config_1 = require("./phea-config");
const logger = log4js_api_1.getLogger('PHEA');
function discover() {
    return __awaiter(this, void 0, void 0, function* () {
        let bridges = yield hue_http_1.HueHttp.discoverBridge();
        return bridges;
    });
}
exports.discover = discover;
function register(ipAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let credentials = yield hue_http_1.HueHttp.registration(ipAddress);
        return credentials;
    });
}
exports.register = register;
function bridge(options) {
    return __awaiter(this, void 0, void 0, function* () {
        configureBridgeOptions(options);
        let bridge = new hue_bridge_1.HueBridge(options);
        return bridge;
    });
}
exports.bridge = bridge;
function configureBridgeOptions(options) {
    if (options == null || typeof (options) !== 'object')
        throw new Error("PHEA [Configuration]: No (or incorrect) configuration dictionary object given. Please see documented examples.");
    if (typeof (options.address) !== 'string')
        throw new Error("PHEA [Configuration]: 'options.address' type invalid or unspecified. 'address' must be a string containing IP in IPv4 format or domain. Can contain port.");
    if (typeof (options.username) !== 'string')
        throw new Error("PHEA [Configuration]: 'options.username' type invalid or unspecified. Must be string.");
    if (typeof (options.psk) !== 'string')
        throw new Error("PHEA [Configuration]: 'options.psk' type invalid or unspecified. Must be string.");
    if (options.dtlsUpdatesPerSecond == null) {
        options.dtlsUpdatesPerSecond = phea_config_1.Config.DTLS_UPDATES_PER_SECOND;
    }
    else if (typeof (options.dtlsUpdatesPerSecond) !== 'number' ||
        options.dtlsUpdatesPerSecond < phea_config_1.Config.DTLS_UPDATES_PER_SECOND_MIN ||
        options.dtlsUpdatesPerSecond > phea_config_1.Config.DTLS_UPDATES_PER_SECOND_MAX) {
        throw new Error("PHEA [Configuration]: 'options.dtlsUpdatesPerSecond' must be of type int between " +
            phea_config_1.Config.DTLS_UPDATES_PER_SECOND_MIN + " and " + phea_config_1.Config.DTLS_UPDATES_PER_SECOND_MAX + " inclusive.");
    }
    if (options.colorUpdatesPerSecond == null) {
        options.colorUpdatesPerSecond = phea_config_1.Config.COLOR_UPDATES_PER_SECOND;
    }
    else if (typeof (options.colorUpdatesPerSecond) !== 'number' ||
        options.colorUpdatesPerSecond < phea_config_1.Config.COLOR_UPDATES_PER_SECOND_MIN ||
        options.colorUpdatesPerSecond > phea_config_1.Config.COLOR_UPDATES_PER_SECOND_MAX) {
        throw new Error("PHEA [Configuration]: 'colorUpdatesPerSecond' must be of type int between " +
            phea_config_1.Config.COLOR_UPDATES_PER_SECOND_MIN + " and " + phea_config_1.Config.COLOR_UPDATES_PER_SECOND_MAX + " inclusive.");
    }
    if (options.dtlsPort == null) {
        options.dtlsPort = phea_config_1.Config.DTLS_PORT;
    }
    else if (typeof (options.dtlsPort) !== 'number' || options.dtlsPort < phea_config_1.Config.DTLS_PORT_MIN ||
        options.dtlsPort > phea_config_1.Config.DTLS_PORT_MAX) {
        throw new Error("PHEA [Configuration]: 'dtlsPort' must be of type int between " +
            phea_config_1.Config.DTLS_PORT_MIN + " and " + phea_config_1.Config.DTLS_PORT_MAX + " inclusive.");
    }
    if (options.dtlsTimeoutMs == null) {
        options.dtlsTimeoutMs = phea_config_1.Config.DTLS_TIMEOUT;
    }
    else if (typeof (options.dtlsTimeoutMs) !== 'number' || options.dtlsTimeoutMs < phea_config_1.Config.DTLS_TIMEOUT_MIN ||
        options.dtlsTimeoutMs > phea_config_1.Config.DTLS_TIMEOUT_MAX) {
        throw new Error("PHEA [Configuration]: 'dtlsTimeout' must be of type int between " +
            phea_config_1.Config.DTLS_TIMEOUT_MIN + " and " + phea_config_1.Config.DTLS_TIMEOUT_MAX + " inclusive.");
    }
}
exports.configureBridgeOptions = configureBridgeOptions;
//# sourceMappingURL=../src/build/phea.js.map