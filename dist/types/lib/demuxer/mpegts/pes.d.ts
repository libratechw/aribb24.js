export declare const PES_HEADER_SIZE = 6;
export declare const packet_start_code_prefix: (pes: Uint8Array) => number;
export declare const stream_id: (pes: Uint8Array) => number;
export declare const PES_packet_length: (pes: Uint8Array) => number;
export declare const has_flags: (pes: Uint8Array) => boolean;
export declare const has_PTS: (pes: Uint8Array) => boolean;
export declare const has_DTS: (pes: Uint8Array) => boolean;
export declare const PTS: (pes: Uint8Array) => number | null;
export declare const DTS: (pes: Uint8Array) => number | null;
export declare const PES_header_length: (pes: Uint8Array) => number;
export default class PacketizedElementaryStreamDemuxer {
    private accendant;
    feed(packet: Uint8Array): Generator<Uint8Array<ArrayBufferLike>, void, unknown>;
}
//# sourceMappingURL=pes.d.ts.map