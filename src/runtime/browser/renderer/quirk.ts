import { ARIBB24_CHARACTER_SIZE } from "../../../lib/parser/parser";
import { CaptionAssociationInformation } from "../../../lib/demuxer/b24/datagroup";
import type { FeederPresentationData } from "../feeder/feeder";

export { shouldHalfWidth } from "../../common/quirk";

export const shouldRemoveTransparentSpace = (info: CaptionAssociationInformation) => {
  if (info.association === 'SBTVD') { return true; }
  return false;
}

export const shouldNotAssumeUseClearScreen = (info: CaptionAssociationInformation) => {
  if (info.association === 'SBTVD') { return true; }
  return false;
}

/** A cue that replaces, rather than appends to, the current caption picture. */
export const startsNewCaptionPicture = (cue: Pick<FeederPresentationData, 'state' | 'data' | 'info'>): boolean => {
  if (shouldNotAssumeUseClearScreen(cue.info)) { return true; }
  let elapsed = cue.state.elapsed_time;
  for (const token of cue.data) {
    if (token.tag === 'TimeControlWait') { elapsed += token.seconds; }
    if (token.tag === 'ClearScreen' && elapsed === 0) { return true; }
  }
  return false;
};

export const shouldIgnoreSmallAsRuby = (size: (typeof ARIBB24_CHARACTER_SIZE)[keyof typeof ARIBB24_CHARACTER_SIZE], info: CaptionAssociationInformation): boolean => {
  // ARIB Caption in Japanese use SSZ to ruby
  if (info.association !== 'ARIB') { return false; }
  if (info.language !== 'jpn') { return false; }
  return size === ARIBB24_CHARACTER_SIZE.Small;
}
