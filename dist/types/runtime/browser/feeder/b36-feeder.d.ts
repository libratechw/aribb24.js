import Feeder, { FeederPresentationData, PartialFeederOption } from "./feeder";
export default class B36Feeder implements Feeder {
    private option;
    private captions;
    constructor(b36: Uint8Array | ArrayBufferLike, option?: PartialFeederOption);
    prepare(_: number): void;
    content(time: number): FeederPresentationData | null;
    clear(): void;
    onAttach(): void;
    onDetach(): void;
    onSeeking(): void;
    destroy(): void;
}
//# sourceMappingURL=b36-feeder.d.ts.map