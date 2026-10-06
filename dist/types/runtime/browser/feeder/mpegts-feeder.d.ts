import { PartialFeederOption } from './feeder';
import DecodingFeeder from './decoding-feeder';
export default class MPEGTSFeeder extends DecodingFeeder {
    constructor(option?: PartialFeederOption);
    feedB24(data: Uint8Array | ArrayBufferLike, pts: number, dts?: number): void;
    feedID3(data: Uint8Array | ArrayBufferLike, pts: number, dts?: number): void;
}
//# sourceMappingURL=mpegts-feeder.d.ts.map