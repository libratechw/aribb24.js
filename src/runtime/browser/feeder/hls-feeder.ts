import { PartialFeederOption } from './feeder';
import { parseID3v2 } from '../../../util/id3';
import { base64ToUint8Array } from '../../../util/binary';
import DecodingFeeder from './decoding-feeder';

export default class HLSFeeder extends DecodingFeeder {
  private media: HTMLMediaElement | null = null;
  private timer: number | null = null;
  private privious_time: number | null = null;
  private id3Tracks: TextTrack[] = [];
  private cueSnapshots: Map<TextTrack, { length: number; first: TextTrackCue | null; last: TextTrackCue | null }> = new Map();
  private readonly onAddTrackHandler: ((event: TrackEvent) => void) = this.onAddTrack.bind(this);
  private readonly onRemoveTrackHandler: ((event: TrackEvent) => void) = this.onRemoveTrack.bind(this);
  private readonly onPlayHandler = this.onPlay.bind(this);
  private readonly onPauseHandler = this.onPause.bind(this);
  private readonly introspectHandler = this.introspect.bind(this);

  public constructor(option?: PartialFeederOption) {
    super(option);
  }

  public attachMedia(media: HTMLVideoElement): void {
    this.detachMedia();
    this.media = media;

    this.setupHandlers();
    this.registerID3Track();
    if (media.paused === false) { this.registerRenderingLoop(); }
  }

  public detachMedia(): void {
    this.unregisterRenderingLoop();
    this.unregisterID3Track();
    this.cleanupHandlers();

    this.media = null
    this.privious_time = null;
    this.cueSnapshots.clear();
  }

  private static isID3Track(track: TextTrack): boolean {
    if (track.kind !== 'metadata') { return false; }

    if (track.inBandMetadataTrackDispatchType === 'com.apple.streaming') { // Safari
      return true;
    } else if (track.label === 'id3') { // hls.js
      return true;
    } else if (track.label === 'Timed Metadata') { // video.js
      return true;
    }

    return false;
  }

  private setupHandlers(): void {
    if (this.media == null) { return; }

    this.media.textTracks.addEventListener('addtrack', this.onAddTrackHandler);
    this.media.textTracks.addEventListener('removetrack', this.onRemoveTrackHandler);
    this.media.addEventListener('play', this.onPlayHandler);
    this.media.addEventListener('pause', this.onPauseHandler);
  }

  private cleanupHandlers(): void {
    if (this.media == null) { return; }

    this.media.textTracks.removeEventListener('addtrack', this.onAddTrackHandler);
    this.media.textTracks.removeEventListener('removetrack', this.onRemoveTrackHandler);
    this.media.removeEventListener('play', this.onPlayHandler);
    this.media.removeEventListener('pause', this.onPauseHandler);
  }

  public destroy(): void {
    this.detachMedia();
    super.destroy();
  }

  private registerID3Track(): void {
    if (this.media == null) { return; }

    for (const track of Array.from(this.media.textTracks)) {
      if (!HLSFeeder.isID3Track(track)) { continue; }
      this.id3Tracks.push(track);
    }
  }

  private unregisterID3Track(): void {
    this.id3Tracks = [];
    this.cueSnapshots.clear();
  }

  private onAddTrack(event: TrackEvent): void {
    const track = event.track!;
    if (!HLSFeeder.isID3Track(track)) { return; }

    this.id3Tracks.push(track);
    this.privious_time = null;
    this.cueSnapshots.delete(track);
  }

  private onRemoveTrack(event: TrackEvent): void {
    const track = event.track!;
    if (!HLSFeeder.isID3Track(track)) { return; }

    this.id3Tracks = this.id3Tracks.filter((t) => t !== track);
    this.cueSnapshots.delete(track);
  }

  private bufferedStart(time: number): number | null {
    if (this.media == null || this.media.seeking) { return null; }
    const ranges = this.media.buffered;
    for (let index = 0; index < ranges.length; index++) {
      if (ranges.start(index) <= time && time <= ranges.end(index)) {
        return ranges.start(index);
      }
    }
    return null;
  }

  private introspect(): void {
    this.registerRenderingLoop();
    this.scanCurrentBuffer();
  }

  private scanCurrentBuffer(): void {
    if (this.media == null) { return; }
    const current_time = this.media.currentTime;
    const buffered_start = this.bufferedStart(current_time);
    if (buffered_start == null) {
      return;
    }
    if (this.privious_time != null && current_time < this.privious_time) {
      super.onSeeking();
    }
    const replay = this.privious_time == null || current_time < this.privious_time;

    for (const track of this.id3Tracks) {
      const cues = Array.from(track.cues ?? []);
      if (cues.length === 0) { continue; }
      const previous = this.cueSnapshots.get(track);
      const changed = previous == null || previous.length !== cues.length
        || previous.first !== cues[0] || previous.last !== cues[cues.length - 1];
      this.cueSnapshots.set(track, { length: cues.length, first: cues[0], last: cues[cues.length - 1] });
      // On attach, seek, or cue-list updates, scan only the buffered range
      // containing the current media time. Older ranges may belong to a
      // different seek position and must not restore stale captions.
      const scanBufferedRange = replay || changed;
      const scan_start = replay ? buffered_start
        : changed ? Math.min(buffered_start, this.privious_time!) : this.privious_time!;

      let prev_index: number | null = null;
      let curr_index: number | null = null;

      {
        let begin = -1, end = cues.length;
        while (begin + 1 < end) {
          const middle = Math.floor((begin + end) / 2);
          const start_time = cues[middle].startTime;

          if (scanBufferedRange ? scan_start <= start_time : scan_start < start_time) {
            end = middle;
          } else {
            begin = middle;
          }
        }
        prev_index = begin;
      }
      {
        let begin = -1, end = cues.length;
        while (begin + 1 < end) {
          const middle = Math.floor((begin + end) / 2);
          const start_time = cues[middle].startTime;

          if (current_time < start_time) {
            end = middle;
          } else {
            begin = middle;
          }
        }
        curr_index = begin;
      }

      if (prev_index === null || curr_index === null || prev_index === curr_index){
        continue;
      }

      if (prev_index < curr_index) {
        // The decoder needs management data before subsequent statements.
        for (let index = prev_index + 1; index <= curr_index; index++) {
          this.feedID3v2Cue(cues[index]);
        }
      }
    }

    this.privious_time = current_time;
    if (replay) {
      // Scan first so prepare() anchors to the management cue in the new
      // buffered range, not one retained from before the seek.
      this.prepare(current_time);
    }
  }

  private registerRenderingLoop(): void {
    this.timer = requestAnimationFrame(this.introspectHandler);
  }

  private unregisterRenderingLoop(): void {
    if (this.timer == null) { return; }
    cancelAnimationFrame(this.timer);
    this.timer = null;
  }

  private onPlay(): void {
    if (this.timer != null) { return }
    this.registerRenderingLoop();
  }

  private onPause(): void {
    this.unregisterRenderingLoop();
  }

  public onSeeking(): void {
    super.onSeeking();
    this.privious_time = null;
    this.cueSnapshots.clear();
  }

  public onSeeked(): void {
    // The regular scan loop is stopped while paused, but the seek target can
    // have a different set of buffered ID3 cues that must be read once.
    this.scanCurrentBuffer();
  }

  private feedID3v2Cue(cue: TextTrackCue): void {
    if (cue.track == null) { return; }

    const id3 = cue as any;
    if (cue.track.inBandMetadataTrackDispatchType === 'com.apple.streaming') { // Safari
      if (id3.value.key === 'PRIV' && id3.value.info === 'aribb24.js') {
        this.feed(id3.value.data, cue.startTime, cue.startTime);
      } else if (id3.value.key === 'TXXX' && id3.value.info === 'aribb24.js') {
        this.feed(base64ToUint8Array(id3.value.data), cue.startTime, cue.startTime);
      }
    } else if (cue.track.label === 'id3') { // hls.js
      if (id3.value.key === 'PRIV' && id3.value.info === 'aribb24.js') {
        this.feed(id3.value.data, cue.startTime, cue.startTime);
      } else if (id3.value.key === 'TXXX' && id3.value.info === 'aribb24.js') {
        this.feed(base64ToUint8Array(id3.value.data), cue.startTime, cue.startTime);
      }
    } else if (cue.track.label === 'Timed Metadata') { // video.js
      if (id3.frame.key === 'PRIV' && id3.frame.owner === 'aribb24.js') {
        this.feed(id3.frame.data, cue.startTime, cue.startTime);
      } else if (id3.frame.key === 'TXXX' && id3.frame.description === 'aribb24.js') {
        this.feed(base64ToUint8Array(id3.frame.data), cue.startTime, cue.startTime);
      }
    }
  }

  public feedB24(data: Uint8Array | ArrayBufferLike, pts: number, dts?: number): void {
    data = data instanceof Uint8Array ? data : new Uint8Array(data);
    this.feed(data, pts, dts ?? pts);
  }

  public feedID3(data: Uint8Array | ArrayBufferLike, pts: number, dts?: number): void {
    data = data instanceof Uint8Array ? data : new Uint8Array(data);

    for (const frame of parseID3v2(data)) {
      switch (frame.id) {
        case 'PRIV': {
          if (frame.owner !== 'aribb24.js') { break; }
          this.feed(frame.data, pts, dts ?? pts);
          break;
        }
        case 'TXXX': {
          if (frame.description !== 'aribb24.js') { break; }
          this.feed(base64ToUint8Array(frame.text), pts, dts ?? pts);
          break;
        }
      }
    }
  }
}
