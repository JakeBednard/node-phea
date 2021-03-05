import { Options } from "./phea-options";
import { dtls } from "node-dtls-client";
import { HueHttp } from "./hue-http";
import { HueDtls } from "./hue-dtls";
import { HueLight } from "./hue-light";


export class PheaEngine {

    public opts: Options;
    public running: boolean;
    private colorRenderLoop: any;
    private dtlsUpdateLoop: any;
    private socket: dtls.Socket | null;
    private lights: HueLight[];
    private groupId: string;

    constructor(options: Options) {
        this.opts = options;
        this.running = false;
        this.colorRenderLoop = null;
        this.dtlsUpdateLoop = null;
        this.socket = null;
        this.lights = [];
        this.groupId = "-1";
    }

    async start(groupIdStr: string): Promise<void> {

        let group: any = await HueHttp.getGroup(this.opts.address, this.opts.username, groupIdStr);

        if (!group.type || group.type != 'Entertainment') {
            throw new Error("Current group selected does not exist or is not a valid Entertainment group.")
        }

        this.groupId = groupIdStr;

        await this._setupLights(group.lights);

        await HueHttp.setEntertainmentMode(true, this.opts.address, this.opts.username, this.groupId);
        
        this.socket = await HueDtls.createSocket(
            this.opts.address,
            this.opts.username,
            this.opts.psk,
            this.opts.dtlsTimeoutMs,
            this.opts.dtlsPort,
            this.opts.dtlsListenPort
        );

        this.running = true;

        this.colorRenderLoop = setInterval(() => { this.stepColor() }, (1000 / this.opts.colorUpdatesPerSecond));
        this.dtlsUpdateLoop = setInterval(() => { this.dtlsUpdate() }, (1000 / this.opts.dtlsUpdatesPerSecond));

    }

    public stop(): void {
        
        this.running = false;
        
        clearInterval(this.colorRenderLoop);
        clearInterval(this.dtlsUpdateLoop);

        if (this.socket != null) {
            this.socket.close();
        }

        HueHttp.setEntertainmentMode(false, this.opts.address, this.opts.username, this.groupId);

        this.groupId = "-1";

    }

    public async transition(lightId: string | number, rgb: number[], tweenTime: number): Promise<void> {
        if (Number(lightId) === 0) {
            this.lights.forEach((light) => {
                light.transitionColor(rgb, tweenTime);
            });
        }
        else {
            this.lights[Number(lightId)-1].transitionColor(rgb, tweenTime);
        }
    }
 
    private stepColor() {

        if (!this.running) return;
        
        this.lights.forEach( light => light.step() );

    }

    private dtlsUpdate() {

        if (!this.running || this.socket == null) {
            return;
        }
        
        let lights: any = [];

        this.lights.forEach((light) => {
            lights.push( light.sampleColor() );
        });

        let msg = HueDtls.createMessage(lights);
        
        this.socket.send(msg);

    }

    private _setupLights(lightIDs: string[]): void {

        this.lights = [];

        lightIDs.forEach(lightId => {
            this.lights.push(new HueLight(lightId.toString(), this.opts));
        });

    }

}
