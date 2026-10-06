export declare const PACKET_SIZE = 188;
export declare const HEADER_SIZE = 4;
export declare const SYNC_BYTE = 71;
export declare const STUFFING_BYTE = 255;
export declare const TIMESTAMP_TIMESCALE = 90000;
export declare const TIMESTAMP_ROLLOVER: number;
export declare const transport_error_indicator: (packet: Uint8Array) => boolean;
export declare const payload_unit_start_indicator: (packet: Uint8Array) => boolean;
export declare const transport_priority: (packet: Uint8Array) => boolean;
export declare const pid: (packet: Uint8Array) => number;
export declare const transport_scrambling_control: (packet: Uint8Array) => number;
export declare const has_adaptation_field: (packet: Uint8Array) => boolean;
export declare const has_payload: (packet: Uint8Array) => boolean;
export declare const continuity_counter: (packet: Uint8Array) => number;
export declare const adaptation_field_length: (packet: Uint8Array) => number;
export declare const pointer_field: (packet: Uint8Array) => number;
export declare const has_pcr: (packet: Uint8Array) => boolean;
export declare const pcr: (packet: Uint8Array) => number | null;
export default class MPEGTransportStream extends TransformStream<Uint8Array, Uint8Array> {
    constructor(writableStrategy?: QueuingStrategy<Uint8Array>, readableStrategy?: QueuingStrategy<Uint8Array>);
}
//# sourceMappingURL=packet.d.ts.map