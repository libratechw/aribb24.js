export declare const readID3Size: (binary: Uint8Array, begin: number, end: number) => number;
export type ID3FramePRIV = {
    id: 'PRIV';
    owner: string;
    data: Uint8Array;
};
export declare const ID3FramePRIV: {
    from(data: Uint8Array): ID3FramePRIV;
};
export type ID3FrameTXXX = {
    id: 'TXXX';
    description: string;
    text: string;
};
export declare const ID3FrameTXXX: {
    from(data: Uint8Array): ID3FrameTXXX | null;
};
export type ID3Frame = ID3FramePRIV | ID3FrameTXXX;
export declare const parseID3v2: (data: Uint8Array) => ID3Frame[];
//# sourceMappingURL=id3.d.ts.map