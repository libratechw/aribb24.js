export declare const BASIC_HEADER_SIZE = 3;
export declare const EXTENDED_HEADER_SIZE = 8;
export declare const CRC_SIZE = 4;
export declare const table_id: (section: Uint8Array) => number;
export declare const section_length: (section: Uint8Array) => number;
export declare const CRC32: (section: Uint8Array, begin?: number, end?: number) => number;
export default class SectionDemuxer {
    private accendant;
    feed(packet: Uint8Array): Generator<Uint8Array<ArrayBufferLike>, void, unknown>;
}
//# sourceMappingURL=section.d.ts.map