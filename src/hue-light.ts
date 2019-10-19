import { Options } from "./phea-options";


export class HueLight {

    public id: string;
    public rgb: number[];
    private opts: Options;
    private gen: any;

    constructor(id: string, options: Options) {
        this.id = id;
        this.opts = options;
        this.rgb = [0,0,0];
        this.gen = null;
        this.transitionColor([0,0,0], 0); // Setup generator;
    }

    public transitionColor(rgb: number[], tweenTime: number): void {
        this.gen = this.setTransition(rgb, tweenTime);
    }

    public step(): void {
        this.gen.next();
    }

    private * setTransition(rgb: number[], tweenTime: number): Generator {

        let tween = this.calculateTween(rgb, tweenTime);

        while(true) {
        
            if (tween.frames-- > 0) {
                this.rgb[0] += tween.dr;
                this.rgb[1] += tween.dg;
                this.rgb[2] += tween.db;   
            } 

            let sample = [this.rgb[0], this.rgb[1], this.rgb[2]]

            yield sample;
        
        } 

    }

    private calculateTween(rgb: number[], tweenTime: number): any {

        let singleFrameMs = (1000 / this.opts.colorUpdatesPerSecond);
        tweenTime = (tweenTime > singleFrameMs) ? tweenTime : singleFrameMs;

        let framesInTransition = Math.floor(tweenTime / singleFrameMs);
       
        let dr = (rgb[0] - this.rgb[0]) / framesInTransition;
        let dg = (rgb[1] - this.rgb[1]) / framesInTransition;
        let db = (rgb[2] - this.rgb[2]) / framesInTransition;

        return {
            'dr': dr,
            'dg': dg,
            'db': db,
            'frames': framesInTransition
        };

    }
    
}
