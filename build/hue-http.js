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
exports.HueHttp = void 0;
const util = require('util');
const RequestPromise = require('request-promise-native');
var HueHttp;
(function (HueHttp) {
    function discoverBridge() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let findBridgeRequest = {
                    method: 'GET',
                    uri: 'https://discovery.meethue.com',
                    json: true
                };
                let response = yield RequestPromise(findBridgeRequest);
                let bridges = [];
                response.forEach((bridge) => {
                    bridges.push({
                        name: bridge.name,
                        id: bridge.id,
                        ip: bridge.internalipaddress,
                        mac: bridge.macaddress
                    });
                });
                return bridges;
            }
            catch (error) {
                switch (error.code) {
                    default:
                        break;
                }
                throw error;
            }
        });
    }
    HueHttp.discoverBridge = discoverBridge;
    function registration(ipAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let registrationRequest = {
                    method: 'POST',
                    uri: util.format('http://%s/api/', ipAddress),
                    json: true,
                    body: {
                        "devicetype": "phea",
                        "generateclientkey": true
                    }
                };
                let response = yield _hueApiRequest(registrationRequest);
                if (!response[0].success) {
                    let error = new Error('No success response recieved from Hue Bridge.');
                    throw error;
                }
                let credentials = {
                    'ip': ipAddress,
                    'username': response[0].success.username,
                    'psk': response[0].success.clientkey
                };
                return credentials;
            }
            catch (error) {
                throw error;
            }
        });
    }
    HueHttp.registration = registration;
    function getGroup(address, username, groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let url = util.format('http://%s/api/%s/groups/', address, username);
                if (groupId) {
                    url += groupId.toString();
                }
                const groupsQuery = {
                    method: 'GET',
                    uri: url,
                    json: true
                };
                const response = yield RequestPromise(groupsQuery);
                return response;
            }
            catch (error) {
                throw Error(error);
            }
        });
    }
    HueHttp.getGroup = getGroup;
    function setEntertainmentMode(state = true, address, username, group) {
        return __awaiter(this, void 0, void 0, function* () {
            let setStateQuery = {
                method: 'PUT',
                uri: util.format('http://%s/api/%s/groups/%s', address, username, group),
                json: true,
                body: { 'stream': { 'active': state } }
            };
            let response = yield RequestPromise(setStateQuery);
            let responseKey = '/groups/' + group + '/stream/active';
            let dtlsState = response[0]['success'][responseKey];
            if (state != dtlsState) {
                throw new Error("PHEA: Hue Bridge DTLS State could not be set.");
            }
        });
    }
    HueHttp.setEntertainmentMode = setEntertainmentMode;
    function _hueApiRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield RequestPromise(request);
                response.forEach((res) => {
                    if (res.error)
                        throw _getHueRestError(res.error);
                });
                return response;
            }
            catch (error) {
                throw error;
            }
        });
    }
    function _getHueRestError(err) {
        return __awaiter(this, void 0, void 0, function* () {
            let error = new Error(err);
            return err;
        });
    }
})(HueHttp = exports.HueHttp || (exports.HueHttp = {}));
//# sourceMappingURL=../src/build/hue-http.js.map