export type CaptionPES = {
    tag: 'Caption';
    data: Uint8Array;
};
export type SuperimposePES = {
    tag: 'Superimpose';
    data: Uint8Array;
};
export type PES = CaptionPES | SuperimposePES;
declare const _default: (data: Uint8Array | ArrayBufferLike) => PES | null;
export default _default;
//# sourceMappingURL=index.d.ts.map