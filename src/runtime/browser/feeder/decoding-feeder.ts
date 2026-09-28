import AVLTree from '../../../util/avl';

import Feeder, { FeederOption, FeederDecodingData, FeederPresentationData, getTokenizeInformation, PartialFeederOption } from './feeder';
import demuxPES from '../../../lib/demuxer/b24/independent';
import demuxDatagroup, { ARIBB24CaptionManagement } from '../../../lib/demuxer/b24/datagroup'
import { ARIBB24ClearScreenToken } from '../../../lib/tokenizer/token';
import { initialState } from '../../../lib/parser/parser';
import { toBrowserTokenWithBitmap } from '../types';
import colortable from '../../common/colortable';

type DecodingOrderedKey = {
  dts: number;
  lang?: number;
};

type QueuedDecodingData = FeederDecodingData & { key: string };

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
  private desiredLang: number | null = null;
  private decoder: AVLTree<DecodingOrderedKey, QueuedDecodingData, number> = new AVLTree<DecodingOrderedKey, QueuedDecodingData, number>(compareKey, compareNumber, calcDecodingOrder);
  private managementTimes: AVLTree<number, number> = new AVLTree<number, number>(compareNumber, compareNumber, (time) => time);
  private replayAfterSeek = false;
  private pendingReplayWindow = false;
  private decoderBuffer: QueuedDecodingData[] = [];
  private notified: Set<string> = new Set();
  private decodingPromise: Promise<void>;
  private decodingNotify: (() => void) = Promise.resolve;
  private abortController: AbortController = new AbortController();
  private present: AVLTree<number, FeederPresentationData> = new AVLTree<number, FeederPresentationData>(compareNumber, compareNumber, (pts) => pts);
  private isDestroyed: boolean = false;
  private generation: number = 0;
  private presentationChangeHandler: (() => void) | null = null;
  private presentationChangeQueued = false;

  public setPresentationChangeHandler(handler: (() => void) | null): void {
    this.presentationChangeHandler = handler;
  }

  protected notifyPresentationChange(): void {
    if (this.presentationChangeHandler == null || this.presentationChangeQueued) { return; }
    this.presentationChangeQueued = true;
    // A renderer failure must surface without terminating the decoder pump.
    queueMicrotask(() => {
      this.presentationChangeQueued = false;
      this.presentationChangeHandler?.();
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
      this.notified.add(segment.key);
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
      for await (const { pts, caption } of this.generator(this.abortController.signal)) {
        if (caption.tag === 'CaptionManagement') {
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
          continue;
        }

        // Caption
        if (this.priviousManagementData == null) { continue; }

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
    this.notifyPresentationChange();
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
    const keyString = `${dts}:${lang}`;
    const segment = { pts, caption, key: keyString };
    const key = { dts, lang };
    this.decoder.insert(key, segment);
    if (caption.tag === 'CaptionManagement') {
      this.managementTimes.insert(dts, dts);
    }
    // A native HLS metadata cue can arrive after content() has advanced past
    // its DTS. Keep it in the tree for later seeks, but decode it now as well.
    // Equality is handled by the next range(), which includes both endpoints.
    if (!this.notified.has(keyString) && this.priviousTime !== null && dts < this.priviousTime) {
      this.notify(segment);
    }
  }

  public prepare(time: number, bufferedStart?: number | null): void {
    if (this.pendingReplayWindow) { return; }
    // The seek reset discards decoded state, not the packets already received.
    // Replay from the latest management packet so statements within the
    // buffered media can be decoded with their language and DRCS state.
    if (this.replayAfterSeek && bufferedStart === null) {
      // Wait until the seek target is buffered. Replaying an old range now
      // would put its last caption over the new position.
      this.priviousTime = null;
      return;
    }
    if (this.replayAfterSeek && bufferedStart != null) {
      const managementTime = this.managementTimes.floor(time);
      const replayStart = managementTime === undefined ? bufferedStart
        : Math.max(managementTime, bufferedStart - SEEK_BUFFER_PREROLL_SECONDS);
      if (managementTime !== undefined && managementTime < replayStart) {
        // Restore language/DRCS state, but not statements from a distant range.
        const management = this.decoder.get({ dts: managementTime, lang: 0 });
        if (management != null) { this.notify(management); }
      }
      this.priviousTime = replayStart;
    } else {
      this.priviousTime = this.replayAfterSeek ? (this.managementTimes.floor(time) ?? time) : time;
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
        if (!this.notified.has(segment.key)) { this.notify(segment); }
      }
    }
    this.pendingReplayWindow = false;
    this.priviousTime = time;
    return this.present.floor(time) ?? null;
  }

  public clear(): void {
    this.decoder.clear();
    this.managementTimes.clear();
    this.replayAfterSeek = false;
    this.pendingReplayWindow = false;
    this.disappearance();
  }

  private disappearance(): void {
    this.generation++;
    this.pendingReplayWindow = false;
    this.notified.clear();
    this.present.forEach(closeValueImageBitmap);
    this.present.clear();
    this.priviousTime = null;
    this.priviousManagementData = null;
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
    this.disappearance();
  }
}
