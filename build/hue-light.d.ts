import { Options } from "./phea-options";
import { LightState } from "./phea-light-state";
export declare class HueLight {
    id: string;
    rgb: number[];
    private opts;
    private gen;
    constructor(id: string, options: Options);
    transitionColor(rgb: number[], tweenTime: number): void;
    sampleColor(): LightState;
    step(): void;
    private setTransition;
    private calculateTween;
}
