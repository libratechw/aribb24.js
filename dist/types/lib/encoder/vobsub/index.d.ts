export declare const ControlType: {
    readonly FORCE: 0;
    readonly START: 1;
    readonly STOP: 2;
    readonly PALLETE: 3;
    readonly ALPHA: 4;
    readonly COORD: 5;
    readonly OFFSET: 6;
    readonly END: 255;
};
export declare const VOBSUBControlForceDisplay: {
    into(): ArrayBuffer;
};
export declare const VOBSUBControlStartCaption: {
    into(): ArrayBuffer;
};
export declare const VOBSUBControlStopCaption: {
    into(): ArrayBuffer;
};
export declare const VOBSUBControlPallete: {
    into(palette: [number, number, number, number]): ArrayBuffer;
};
export declare const VOBSUBControlAlpha: {
    into(alpha: [number, number, number, number]): ArrayBuffer;
};
export declare const VOBSUBControlCoordDefinition: {
    into(coord: [number, number, number, number]): ArrayBuffer;
};
export declare const VOBSUBControlRLEOffset: {
    into(offset: [number, number]): ArrayBuffer;
};
export declare const VOBSUBControlEND: {
    into(): ArrayBuffer;
};
export declare const encodeControl: (type: (typeof ControlType)[keyof typeof ControlType], data: ArrayBufferLike) => ArrayBufferLike;
export declare const indexToRLE: (image: number[][]) => ArrayBuffer;
type RGBATuple = [r: number, g: number, b: number, a: number];
export declare const encodeImage: (width: number, height: number, image: Uint8ClampedArray, color: [RGBATuple, RGBATuple, RGBATuple, RGBATuple]) => [ArrayBuffer, ArrayBuffer];
export declare const encode: (x: number, y: number, width: number, height: number, image: Uint8ClampedArray, duration: number | null, colors: [string, string, string, string], palette: string[]) => ArrayBufferLike;
export {};
//# sourceMappingURL=index.d.ts.map