export declare class ByteStream {
    private data;
    private view;
    private offset;
    constructor(data: Uint8Array);
    exists(length: number): boolean;
    isEmpty(): boolean;
    read(length: number): Uint8Array;
    peekU8(): number;
    readU8(): number;
    peekU16(): number;
    readU16(): number;
    peekU24(): number;
    readU24(): number;
    peekU32(): number;
    readU32(): number;
    readAll(): Uint8Array;
}
//# sourceMappingURL=bytestream.d.ts.map