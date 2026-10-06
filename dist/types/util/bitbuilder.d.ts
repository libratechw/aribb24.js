export default class BitBuilder {
    private bits;
    private data;
    private fill;
    writeBits(value: number, length: number): void;
    writeBool(value: boolean): void;
    writeByte(value: number): void;
    writeByteAlign(fill?: 0 | 1): void;
    isByteAligned(): boolean;
    writeBytes(value: Iterable<number>): void;
    build(): ArrayBuffer;
}
//# sourceMappingURL=bitbuilder.d.ts.map