"use strict";

const os = require('os');
const path = require('path');
const Bridge = require("./src/hue-bridge");
const HueApi = require("./src/hue-api-controller");
const log4js = require('@log4js-node/log4js-api');

const logger = log4js.getLogger('PHEA');

const DEFAULT_PORT = 2100;
const DEFAULT_FPS = 50;
const DEFAULT_MIN_FPS = 10;
const DEFAULT_MAX_FPS = 120;
const DEFAULT_SOCKET_TIMEOUT_MS = 100;


module.exports = {
    'discover': discover,
    'bridge': bridge,
    'pheasy': pheasy
}


async function discover() {
    let bridges = await HueApi.discoverBridge();
    return bridges;
}

async function bridge(options) {
    let bridge = new Bridge(options);
    return bridge;
}

async function pheasy(options) {
    // This is going to be the new easy one-click
    // and go setup.
}
