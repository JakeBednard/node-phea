import { HueHttp } from "./hue-http";
import { PheaEngine } from "./phea-engine"; 
import { Options } from "./phea-options";


export class HueBridge {

    public opts: Options;
    public pheaEngine: PheaEngine | null;

    constructor(options: Options) {
        this.opts = options;
        this.pheaEngine = null;
    }

    async register(): Promise<any> {
        let credentials = await HueHttp.registration(this.opts.address);
        return credentials;
    }

    async getGroup(groupId: string | number): Promise<any> {  
        
        let group: any;

        if (!Number.isInteger(Number(groupId))) {
            throw new Error("groupId must be int | string [0,infinity] inclusive.")
        }
        else if (Number(groupId) < 0) {
            throw new Error("groupId must be int | string [0,infinity] inclusive.")
        }

        group = await HueHttp.getGroup(this.opts.address, this.opts.username, groupId);
        
        return group;

    }

    async start(groupId: string): Promise<void> {

        if (!Number.isInteger(Number(groupId))) {
            throw new Error("GroupId must be in integer [0,31] inclusive as type string or empty string.");
        }
        else if (Number(groupId) < 0 || Number(groupId) > 31) {
            throw new Error("GroupId must be in integer [0,31] inclusive as type string or empty string."); 
        }

        if (this.pheaEngine == null) {
            this.pheaEngine = new PheaEngine(this.opts);
            await this.pheaEngine.start(groupId);
        }

    }

    async stop(): Promise<void> {

        if (this.pheaEngine && this.pheaEngine.running) {
            await this.pheaEngine.stop();
            this.pheaEngine = null;
        }

    }

    async transition(lightId: (string | number)[], rgb: number[], tweenTime=0): Promise<void> {

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
                throw new Error("lightId | lightId[] must be int[0,31] inclusive as type string.")
            }
            else if (Number(id) < 0 || Number(id) > 16) {
                throw new Error("lightId | lightId[] must be int[0,31] inclusive as type string."); 
            }

            if (this.pheaEngine != null && this.pheaEngine.running) {
                this.pheaEngine.transition(id, rgb, tweenTime); 
            }

        });

    }
    
}

