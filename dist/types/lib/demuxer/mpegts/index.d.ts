import { ARIBB24CaptionData } from "../b24/datagroup";
export type ARIBB24MPEGTSData = {
    tag: 'Caption' | 'Superimpose';
    pts: number;
    dts: number;
    data: ARIBB24CaptionData;
};
export type ARIBB24MPEGTSDemuxOption = {
    serviceId: number | null;
    offset: 'VIDEO' | 'AUDIO' | 'BOTH' | 'NONE';
    type: 'Caption' | 'Superimpose';
};
export default function (readable: ReadableStream<Uint8Array>, option?: Partial<ARIBB24MPEGTSDemuxOption>): AsyncIterable<ARIBB24MPEGTSData>;
//# sourceMappingURL=index.d.ts.map