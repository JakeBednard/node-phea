"use strict";

const HueHttp = require("./hue-http");
const PheaEngine = require("./phea-engine");


module.exports = class HueBridge {

    constructor(options) {
        this.opts = options;
    }

    async register() {

    }

    async loadCredentials() {

    }

    async setGroup(groupId) {
        this.opts.group = groupId;
    }

    async getGroup(groupId) {
        let group = await HueHttp.getGroup(groupId);
        return group;
    }

    async createEngine() {
        let pheaEngine = PheaEngine();
        await pheaEngine.init();
        return pheaEngine;
    }

}