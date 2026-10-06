import { ARIBB24ParserState } from "../../../lib/parser/parser";
import datagroup, { CaptionAssociationInformation } from "../../../lib/demuxer/b24/datagroup";
import ARIBB24Tokenizer from "../../../lib/tokenizer/b24/tokenizer";
import { ARIBB24BrowserToken } from "../types";
type FeederTimeOffsetOption = {
    time: number;
};
type FeederTokenizeOption = {
    pua: boolean;
};
type FeederRecieveOption = {
    association: 'ARIB' | 'SBTVD' | null;
    type: 'Caption' | 'Superimpose';
    language: number | string | [string, number];
};
export type FeederOption = {
    recieve: FeederRecieveOption;
    tokenizer: FeederTokenizeOption;
    offset: FeederTimeOffsetOption;
};
export type PartialFeederOption = Partial<{
    recieve: Partial<FeederRecieveOption>;
    tokenizer: Partial<FeederTokenizeOption>;
    offset: Partial<FeederTimeOffsetOption>;
}>;
export declare const FeederOption: {
    from(option?: PartialFeederOption): FeederOption;
};
export declare const getTokenizeInformation: (language: string, TCS: number, option: FeederOption) => [CaptionAssociationInformation["association"], ARIBB24Tokenizer, ARIBB24ParserState] | null;
export type FeederDecodingData = {
    pts: number;
    caption: Exclude<ReturnType<typeof datagroup>, null>;
};
export type FeederPresentationData = {
    pts: number;
    duration: number;
    state: ARIBB24ParserState;
    info: CaptionAssociationInformation;
    data: ARIBB24BrowserToken[];
};
export default interface Feeder {
    /** Buffered range start for a seek target; null waits for media, omission replays only near time. */
    prepare(time: number, bufferedStart?: number | null): void;
    content(time: number, bufferedStart?: number | null): FeederPresentationData | null;
    /** Decoded cues after from through to, in PTS order; null means the anchor is no longer retained.
     * Passing null as from reads all retained cues. References and bitmaps remain owned by the feeder.
     * The last cue must be the same reference returned by content(to), not a copy. */
    contentRange?(from: number | null, to: number): readonly FeederPresentationData[] | null;
    /** Release history before the earliest retained media range, preserving the active picture and its decoding context.
     * Omit this call when the media retention boundary is unknown. */
    prune?(before: number): void;
    clear(): void;
    destroy(): void;
    onAttach(): void;
    onDetach(): void;
    onSeeking(): void;
    /** Refresh buffered metadata before a paused seek is repainted. */
    onSeeked?(): void;
    /** Notify the controller when asynchronous decoding changes the visible cue. */
    setPresentationChangeHandler?(handler: ((changedPts?: readonly number[]) => void) | null): void;
}
export {};
//# sourceMappingURL=feeder.d.ts.map