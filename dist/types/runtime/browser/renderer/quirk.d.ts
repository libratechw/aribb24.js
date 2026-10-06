import { ARIBB24_CHARACTER_SIZE } from "../../../lib/parser/parser";
import { CaptionAssociationInformation } from "../../../lib/demuxer/b24/datagroup";
import type { FeederPresentationData } from "../feeder/feeder";
export { shouldHalfWidth } from "../../common/quirk";
export declare const shouldRemoveTransparentSpace: (info: CaptionAssociationInformation) => boolean;
export declare const shouldNotAssumeUseClearScreen: (info: CaptionAssociationInformation) => boolean;
/** A cue that replaces, rather than appends to, the current caption picture. */
export declare const startsNewCaptionPicture: (cue: Pick<FeederPresentationData, "state" | "data" | "info">) => boolean;
export declare const shouldIgnoreSmallAsRuby: (size: (typeof ARIBB24_CHARACTER_SIZE)[keyof typeof ARIBB24_CHARACTER_SIZE], info: CaptionAssociationInformation) => boolean;
//# sourceMappingURL=quirk.d.ts.map