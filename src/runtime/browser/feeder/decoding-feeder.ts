import AVLTree from '../../../util/avl';

import Feeder, { FeederOption, FeederDecodingData, FeederPresentationData, getTokenizeInformation, PartialFeederOption } from './feeder';
import demuxPES from '../../../lib/demuxer/b24/independent';
import demuxDatagroup, { ARIBB24CaptionManagement } from '../../../lib/demuxer/b24/datagroup'
import { ARIBB24ClearScreenToken } from '../../../lib/tokenizer/token';
import { initialState } from '../../../lib/parser/parser';
import { toBrowserTokenWithBitmap } from '../types';
import colortable from '../../common/colortable';
import { startsNewCaptionPicture } from '../renderer/quirk';

type DecodingOrderedKey = {
  dts: number;
  lang?: number;
};

type QueuedDecodingData = FeederDecodingData & { key: DecodingOrderedKey; packet: Uint8Array };

const samePacket = (a: Uint8Array, b: Uint8Array): boolean =>
  a.length === b.length && a.every((byte, index) => byte === b[index]);

// Caption packets can precede the first buffered video frame of a seek by a
// small amount. Keep that pre-roll without replaying a distant old range.
export const SEEK_BUFFER_PREROLL_SECONDS = 0.5;

const calcDecodingOrder = ({ dts }: DecodingOrderedKey): number => {
  return dts;
}

const compareNumber = (a: number, b: number) => {
  return Math.sign(a - b) as (-1 | 0 | 1);
}

const compareKey = (a: DecodingOrderedKey, b: DecodingOrderedKey) => {
  if (compareNumber(a.dts, b.dts) !== 0) {
    return compareNumber(a.dts, b.dts);
  } else {
    return compareNumber(a.lang ?? -1, b.lang ?? -1)
  }
}

const closeValueImageBitmap = (value: FeederPresentationData) => {
  for (const token of value.data) {
    if (token.tag !== 'Bitmap') { continue; }
    token.normal_bitmap.close();
    token.flashing_bitmap?.close();
  }
}

export default abstract class DecodingFeeder implements Feeder {
  private option: FeederOption;
  private priviousTime: number | null = null;
  private priviousManagementData: ARIBB24CaptionManagement | null = null;
  private priviousManagementDts: number | null = null;
  private desiredLang: number | null = null;
  private decoder: AVLTree<DecodingOrderedKey, QueuedDecodingData, number> = new AVLTree<DecodingOrderedKey, QueuedDecodingData, number>(compareKey, compareNumber, calcDecodingOrder);
  private managementTimes: AVLTree<number, number> = new AVLTree<number, number>(compareNumber, compareNumber, (time) => time);
  private replayAfterSeek = false;
  private pendingReplayWindow = false;
  private retainedWindow: { bufferedStart: number; decodeStart: number } | null = null;
  private decodedWindowStart: number | null = null;
  private decoderBuffer: QueuedDecodingData[] = [];
  private awaitingManagement: QueuedDecodingData[] = [];
  private notified: WeakSet<QueuedDecodingData> = new WeakSet();
  private decodingPromise: Promise<void>;
  private decodingNotify: (() => void) = Promise.resolve;
  private abortController: AbortController = new AbortController();
  private present: AVLTree<number, FeederPresentationData> = new AVLTree<number, FeederPresentationData>(compareNumber, compareNumber, (pts) => pts);
  private isDestroyed: boolean = false;
  private generation: number = 0;
  private presentationChangeHandler: ((changedPts?: readonly number[]) => void) | null = null;
  private presentationChangeQueued = false;
  private changedPresentationPts: Set<number> = new Set();

  public setPresentationChangeHandler(handler: ((changedPts?: readonly number[]) => void) | null): void {
    this.presentationChangeHandler = handler;
    if (handler == null) { this.changedPresentationPts.clear(); }
  }

  protected notifyPresentationChange(pts?: number): void {
    if (this.presentationChangeHandler == null) { return; }
    if (pts !== undefined) { this.changedPresentationPts.add(pts); }
    if (this.presentationChangeQueued) { return; }
    this.presentationChangeQueued = true;
    // A renderer failure must surface without terminating the decoder pump.
    queueMicrotask(() => {
      this.presentationChangeQueued = false;
      const changed = [...this.changedPresentationPts];
      this.changedPresentationPts.clear();
      this.presentationChangeHandler?.(changed);
    });
  }

  public constructor(option?: PartialFeederOption) {
    this.option = FeederOption.from(option);
    this.decodingPromise = new Promise((resolve) => {
      this.decodingNotify = resolve;
    });
    this.pump();
  }

  private notify(segment: QueuedDecodingData | null): void {
    if (segment != null) {
      this.notified.add(segment);
      this.decoderBuffer.push(segment);
    } else {
      // Clear the old generation before a post-seek cue can enter the buffer.
      this.decoderBuffer = [];
      this.abortController.abort();
      this.abortController = new AbortController();
    }

    this.decodingNotify?.();
  }

  private async *generator(signal: AbortSignal) {
    while (true) {
      // A new cue may arrive while the previous generator is being aborted.
      if (this.decoderBuffer.length === 0) {
        await this.decodingPromise;
        this.decodingPromise = new Promise<void>((resolve) => {
          this.decodingNotify = resolve;
        });
      }
      if (signal.aborted) { return; }

      const recieved = [... this.decoderBuffer];
      this.decoderBuffer = [];

      for (const segment of recieved) {
        if (signal.aborted) { return; }
        yield segment;
      }
    }
  }

  private async pump() {
    while (!this.isDestroyed) {
      for await (const segment of this.generator(this.abortController.signal)) {
        const { pts, caption } = segment;
        if (caption.tag === 'CaptionManagement') {
          // Retain late packets for seeks, but do not rewind the current
          // management generation when an older group arrives out of order.
          if (this.priviousManagementDts != null && segment.key.dts < this.priviousManagementDts) { continue; }
          this.priviousManagementDts = segment.key.dts;
          if (this.priviousManagementData?.group === caption.group) { continue; }

          if (typeof(this.option.recieve.language) === 'number') {
            this.desiredLang = this.option.recieve.language;
          } else {
            const name = (typeof(this.option.recieve.language) === 'string') ? this.option.recieve.language : this.option.recieve.language[0];
            const index = (typeof(this.option.recieve.language) === 'string') ? 0 : this.option.recieve.language[1];
            const lang = [... caption.languages].sort(({ lang: fst }, { lang: snd}) => fst - snd).filter(({ iso_639_language_code }) => iso_639_language_code === name);
            this.desiredLang = lang?.[index]?.lang ?? null;
          }
          this.priviousManagementData = caption;

          this.insertPresentation(pts, {
            pts,
            duration: Number.POSITIVE_INFINITY,
            state: initialState,
            info: {
              association: 'UNKNOWN',
              language: 'und',
            },
            data: [ARIBB24ClearScreenToken.from()]
          });
          // HLS metadata with the same timestamp can arrive out of order.
          // Retry a statement only after its management packet is installed.
          const stillAwaiting: QueuedDecodingData[] = [];
          for (const pending of this.awaitingManagement) {
            if (pending.caption.tag === 'CaptionStatement' &&
                pending.caption.group === caption.group && pending.pts >= pts) {
              this.notify(pending);
            } else if (pending.caption.group !== caption.group) {
              stillAwaiting.push(pending);
            }
          }
          this.awaitingManagement = stillAwaiting;
          continue;
        }

        // Caption
        if (this.priviousManagementData == null || this.priviousManagementData.group !== caption.group) {
          this.awaitingManagement.push(segment);
          continue;
        }

        const entry = this.priviousManagementData.languages.find((entry) => entry.lang === caption.lang);
        if (entry == null) { continue; }
        if (this.desiredLang !== caption.lang) { continue; }

        const specification = getTokenizeInformation(entry.iso_639_language_code, entry.TCS, this.option);
        if (specification == null) { continue; }

        const [association, tokenizer, state] = specification;
        const generation = this.generation;
        const tokenized = await toBrowserTokenWithBitmap(tokenizer.tokenize(caption), colortable);
        if (generation !== this.generation || this.isDestroyed) {
          closeValueImageBitmap({ pts, duration: 0, state, info: { association, language: entry.iso_639_language_code }, data: tokenized });
          continue;
        }

        let duration = Number.POSITIVE_INFINITY;
        let elapse = 0;
        for (const token of tokenized) {
          if (token.tag === 'ClearScreen') {
            if (elapse === 0) { continue; }
            duration = elapse;
          } else if (token.tag === 'TimeControlWait') {
            elapse += token.seconds;
          }
        }

        this.insertPresentation(pts, {
          pts,
          duration,
          state,
          info: {
            association,
            language: entry.iso_639_language_code,
          },
          data: tokenized
        });
      }
    }
  }

  private insertPresentation(pts: number, value: FeederPresentationData): void {
    const previous = this.present.get(pts);
    if (previous != null) { closeValueImageBitmap(previous); }
    this.present.insert(pts, value);
    this.notifyPresentationChange(pts);
  }

  protected feed(data: Uint8Array, pts: number, dts: number) {
    const datagroup = demuxPES(data);
    if (datagroup == null) { return; }
    if (datagroup.tag !== this.option.recieve.type) { return; }

    const caption = demuxDatagroup(datagroup.data);
    if (caption == null) { return ; }

    const lang = caption.tag === 'CaptionStatement' ? (caption.lang + 1) : 0;

    pts += this.option.offset.time;
    dts += this.option.offset.time;
    const key = { dts, lang };
    const previous = this.decoder.get(key);
    if (previous?.pts === pts && samePacket(previous.packet, data)) {
      if (!this.notified.has(previous) && this.priviousTime !== null && dts <= this.priviousTime) {
        this.notify(previous);
      }
      return;
    }
    const segment = { pts, caption, key, packet: data.slice() };
    this.decoder.insert(key, segment);
    if (caption.tag === 'CaptionManagement') {
      this.managementTimes.insert(dts, dts);
    }
    // A native HLS metadata cue can arrive after content() has advanced past
    // its DTS. Keep it in the tree for later seeks, but decode it now as well.
    // A paused media clock may not call content() again after an equal-DTS cue arrives.
    if (!this.notified.has(segment) && this.priviousTime !== null && dts <= this.priviousTime) {
      this.notify(segment);
    }
  }

  public prepare(time: number, bufferedStart?: number | null): void {
    if (this.pendingReplayWindow) { return; }
    // Direct feeder callers may not know the buffered range. In that case,
    // replay only near the requested time rather than from a distant range.
    const replayBufferedStart = bufferedStart === undefined ? time : bufferedStart;
    // The seek reset discards decoded state, not the packets already received.
    // Same-group management retransmissions do not clear the picture. Replay
    // from the start of the current group, not its most recent retransmission.
    if (this.replayAfterSeek && replayBufferedStart === null) {
      // Wait until the seek target is buffered. Replaying an old range now
      // would put its last caption over the new position.
      this.priviousTime = null;
      return;
    }
    if (this.replayAfterSeek && replayBufferedStart != null) {
      let managementTime: number | undefined;
      let group: number | undefined;
      for (const dts of this.managementTimes.range(Number.NEGATIVE_INFINITY, time)) {
        const management = this.decoder.get({ dts, lang: 0 });
        if (management?.caption.tag !== 'CaptionManagement') { continue; }
        if (management.caption.group !== group) {
          managementTime = dts;
          group = management.caption.group;
        }
      }
      // A page can start before the live buffer and remain visible. Only
      // extend replay for the range whose retained picture prune() established.
      const bufferedReplayStart = this.retainedWindow?.bufferedStart === replayBufferedStart
        ? Math.min(replayBufferedStart - SEEK_BUFFER_PREROLL_SECONDS, this.retainedWindow.decodeStart)
        : replayBufferedStart - SEEK_BUFFER_PREROLL_SECONDS;
      const replayStart = managementTime === undefined ? bufferedReplayStart
        : Math.max(managementTime, bufferedReplayStart);
      if (managementTime !== undefined && managementTime < replayStart) {
        // Restore language/DRCS state, but not statements from a distant range.
        const contextTime = this.managementTimes.floor(replayStart)!;
        if (contextTime < replayStart) {
          const management = this.decoder.get({ dts: contextTime, lang: 0 });
          if (management != null) { this.notify(management); }
        }
      }
      this.priviousTime = replayStart;
      this.decodedWindowStart = replayStart;
    } else {
      this.priviousTime = time;
      this.decodedWindowStart ??= time;
    }
    this.pendingReplayWindow = this.replayAfterSeek;
    this.replayAfterSeek = false;
  }

  public content(time: number, bufferedStart?: number | null): FeederPresentationData | null {
    if (this.replayAfterSeek) {
      this.prepare(time, bufferedStart);
      if (this.replayAfterSeek) { return null; }
    }
    if (this.priviousTime != null) {
      for (const segment of this.decoder.range(this.priviousTime, time)) {
        if (!this.notified.has(segment)) { this.notify(segment); }
      }
    }
    this.pendingReplayWindow = false;
    this.priviousTime = time;
    return this.present.floor(time) ?? null;
  }

  public clear(): void {
    this.decoder.clear();
    this.managementTimes.clear();
    this.retainedWindow = null;
    this.replayAfterSeek = false;
    this.pendingReplayWindow = false;
    this.disappearance();
  }

  public prune(before: number): void {
    if (!Number.isFinite(before) || this.priviousTime == null || before > this.priviousTime) { return; }
    const cutoff = before - SEEK_BUFFER_PREROLL_SECONDS;
    // A seek into a later range may decode only a management cue here, not
    // the earlier range's active picture. It is not evidence for eviction.
    if (this.decodedWindowStart == null || cutoff < this.decodedWindowStart) { return; }
    let pictureStart: number | undefined;
    let previous: FeederPresentationData | undefined;
    for (const cue of this.present.range(Number.NEGATIVE_INFINITY, cutoff)) {
      if (pictureStart === undefined || startsNewCaptionPicture(cue) ||
          (previous != null && cue.pts >= previous.pts + previous.duration)) {
        pictureStart = cue.pts;
      }
      previous = cue;
    }
    // A management cue replayed only for language/DRCS context can precede
    // the decoded window. It does not prove that the excluded page is active.
    if (pictureStart === undefined || pictureStart < this.decodedWindowStart) { return; }
    // Keep the whole still-visible page, not just its latest append-only cue.
    // DTS and PTS need not coincide; retain the context preceding that page's DTS.
    const expired = [...this.decoder.range(Number.NEGATIVE_INFINITY, cutoff)]
      .filter((segment) => segment.pts < pictureStart);
    const pagePackets = [...this.decoder.range(Number.NEGATIVE_INFINITY, cutoff)]
      .filter((segment) => segment.pts >= pictureStart);
    const contextDts = pagePackets.reduce((earliest, segment) => Math.min(earliest, segment.key.dts), cutoff);
    this.retainedWindow = { bufferedStart: before, decodeStart: Math.min(pictureStart, contextDts) };
    const contextTime = this.managementTimes.floor(contextDts);
    for (const segment of expired) {
      if (segment.key.lang === 0 && segment.key.dts === contextTime) { continue; }
      this.decoder.delete(segment.key);
      if (segment.key.lang === 0) { this.managementTimes.delete(segment.key.dts); }
    }
    for (const cue of [...this.present.range(Number.NEGATIVE_INFINITY, pictureStart)]) {
      if (cue.pts === pictureStart) { continue; }
      closeValueImageBitmap(cue);
      this.present.delete(cue.pts);
    }
    this.awaitingManagement = this.awaitingManagement.filter((segment) => segment.pts >= pictureStart);
  }

  public contentRange(from: number | null, to: number): readonly FeederPresentationData[] | null {
    if (from != null && !this.present.has(from)) { return null; }
    return [...this.present.range(from ?? Number.NEGATIVE_INFINITY, to)]
      .filter((cue) => from == null || cue.pts > from);
  }

  private disappearance(): void {
    this.generation++;
    this.pendingReplayWindow = false;
    this.notified = new WeakSet();
    this.awaitingManagement = [];
    this.present.forEach(closeValueImageBitmap);
    this.present.clear();
    this.priviousTime = null;
    this.priviousManagementData = null;
    this.priviousManagementDts = null;
    this.decodedWindowStart = null;
    this.notify(null);
    this.notifyPresentationChange();
  }

  public onAttach(): void {
    this.disappearance();
  }

  public onDetach(): void {
    this.disappearance();
  }

  public onSeeking(): void {
    this.disappearance();
    this.replayAfterSeek = true;
  }

  public destroy(): void {
    this.isDestroyed = true;
    this.presentationChangeHandler = null;
    this.clear();
  }
}
