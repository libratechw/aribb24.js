export declare const MPEGTSStreamType: {
    readonly VIDEO: "VIDEO";
    readonly AUDIO: "AUDIO";
    readonly ARIBB24_CAPTION: "ARIBB24_CAPTION";
    readonly ARIBB24_SUPERIMPOSE: "ARIBB24_SUPERIMPOSE";
};
export type MPEGTSStreamType = (typeof MPEGTSStreamType)[keyof typeof MPEGTSStreamType];
declare const _default: (pmt: Uint8Array) => {
    type: MPEGTSStreamType;
    elementary_PID: number;
}[];
export default _default;
//# sourceMappingURL=pmt.d.ts.map