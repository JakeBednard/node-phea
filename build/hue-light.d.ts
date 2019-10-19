import { Options } from "./phea-options";
export declare class HueLight {
    id: string;
    rgb: number[];
    private opts;
    private gen;
    constructor(id: string, options: Options);
    transitionColor(rgb: number[], tweenTime: number): void;
    step(): void;
    private setTransition;
    private calculateTween;
}
