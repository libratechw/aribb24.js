import { afterEach, expect, test, vi } from 'vitest';

import Controller from '@/runtime/browser/controller/controller';
import HLSFeeder from '@/runtime/browser/feeder/hls-feeder';
import type Renderer from '@/runtime/browser/renderer/renderer';
import mux from '@/lib/muxer/b24/datagroup';
import { ARIBB24CaptionData, RollupModeType, TimeControlModeType } from '@/lib/demuxer/b24/datagroup';

afterEach(() => vi.unstubAllGlobals());

test('decodes and repaints a buffered HLS cue after play, pause and seek', async () => {
  const pending = new Map<number, FrameRequestCallback>();
  let nextId = 1;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    const id = nextId++;
    pending.set(id, callback);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => pending.delete(id));
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });

  const management = {
    tag: 'CaptionManagement', group: 0, timeControlMode: TimeControlModeType.FREE,
    languages: [{lang: 0, displayMode: 0b0101, iso_639_language_code: 'jpn',
      format: 7, rollup: RollupModeType.NOT_ROLLUP, TCS: 0b00}], units: [],
  } as const satisfies ARIBB24CaptionData;
  const statement = {
    tag: 'CaptionStatement', group: 0, lang: 0,
    timeControlMode: TimeControlModeType.FREE, units: [],
  } as const satisfies ARIBB24CaptionData;
  const track = {
    kind: 'metadata', inBandMetadataTrackDispatchType: 'com.apple.streaming',
    cues: [] as TextTrackCue[],
  };
  track.cues.push(...[[0, management], [1, statement]].map(([startTime, caption]) => ({
    startTime, track: track as unknown as TextTrack,
    value: {key: 'PRIV', info: 'aribb24.js', data: new Uint8Array([
      0x80, 0, 0, ...new Uint8Array(mux(caption as ARIBB24CaptionData)),
    ])},
  })) as unknown as TextTrackCue[]);
  const mediaElement = Object.assign(new EventTarget(), {
    currentTime: 0, paused: true, seeking: false, parentElement: {} as HTMLElement,
    buffered: {length: 1, start: () => 0, end: () => 4} as TimeRanges,
    textTracks: Object.assign(new EventTarget(), {0: track, length: 1}),
  });
  const media = mediaElement as unknown as HTMLVideoElement;
  const render = vi.fn();
  const renderer = {
    render, clear: vi.fn(), hide: vi.fn(), show: vi.fn(), destroy: vi.fn(),
    onAttach: vi.fn(), onDetach: vi.fn(), onContainerResize: vi.fn(() => false),
    onVideoResize: vi.fn(() => false), onPlay: vi.fn(), onPause: vi.fn(), onSeeking: vi.fn(),
  } satisfies Renderer;
  const feeder = new HLSFeeder();
  const controller = new Controller();
  try {
    controller.attachFeeder(feeder);
    controller.attachRenderer(renderer);
    controller.attachMedia(media);
    feeder.attachMedia(media);
    mediaElement.paused = false;
    media.dispatchEvent(new Event('play'));
    mediaElement.paused = true;
    media.dispatchEvent(new Event('pause'));
    expect(pending.size).toBe(0);

    mediaElement.seeking = true;
    media.dispatchEvent(new Event('seeking'));
    mediaElement.currentTime = 1.5;
    mediaElement.seeking = false;
    media.dispatchEvent(new Event('seeked'));
    await vi.waitFor(() => expect(feeder.content(1.5)?.pts).toBe(1));
    await vi.waitFor(() => expect(render.mock.lastCall?.[1]).toEqual([]));
    expect(pending.size).toBe(0);
  } finally {
    controller.detachMedia();
    controller.detachFeeder();
    feeder.destroy();
  }
});

test('repaints a paused HLS seek after the target buffer and cues arrive later', async () => {
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => {});
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });

  const management = {
    tag: 'CaptionManagement', group: 0, timeControlMode: TimeControlModeType.FREE,
    languages: [{lang: 0, displayMode: 0b0101, iso_639_language_code: 'jpn',
      format: 7, rollup: RollupModeType.NOT_ROLLUP, TCS: 0b00}], units: [],
  } as const satisfies ARIBB24CaptionData;
  const statement = {
    tag: 'CaptionStatement', group: 0, lang: 0,
    timeControlMode: TimeControlModeType.FREE, units: [],
  } as const satisfies ARIBB24CaptionData;
  const track = {
    kind: 'metadata', inBandMetadataTrackDispatchType: 'com.apple.streaming',
    cues: [] as TextTrackCue[],
  };
  let ranges = [[0, 4]];
  const mediaElement = Object.assign(new EventTarget(), {
    currentTime: 1000, paused: true, seeking: false, parentElement: {} as HTMLElement,
    buffered: {
      get length() { return ranges.length; },
      start: (index: number) => ranges[index][0],
      end: (index: number) => ranges[index][1],
    } as TimeRanges,
    textTracks: Object.assign(new EventTarget(), {0: track, length: 1}),
  });
  const media = mediaElement as unknown as HTMLVideoElement;
  const render = vi.fn();
  const renderer = {
    render, clear: vi.fn(), hide: vi.fn(), show: vi.fn(), destroy: vi.fn(),
    onAttach: vi.fn(), onDetach: vi.fn(), onContainerResize: vi.fn(() => false),
    onVideoResize: vi.fn(() => false), onPlay: vi.fn(), onPause: vi.fn(), onSeeking: vi.fn(),
  } satisfies Renderer;
  const feeder = new HLSFeeder();
  const controller = new Controller();
  try {
    controller.attachFeeder(feeder);
    controller.attachRenderer(renderer);
    controller.attachMedia(media);
    feeder.attachMedia(media);
    media.dispatchEvent(new Event('seeking'));
    media.dispatchEvent(new Event('seeked'));
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(render).not.toHaveBeenCalled();

    track.cues.push(...[[999.2, management], [999.5, statement]].map(([startTime, caption]) => ({
      startTime, track: track as unknown as TextTrack,
      value: {key: 'PRIV', info: 'aribb24.js', data: new Uint8Array([
        0x80, 0, 0, ...new Uint8Array(mux(caption as ARIBB24CaptionData)),
      ])},
    })) as unknown as TextTrackCue[]);
    ranges = [[0, 4], [999, 1002]];
    media.dispatchEvent(new Event('progress'));
    await vi.waitFor(() => expect(feeder.content(1000, 999)?.pts).toBe(999.5));
    expect(render).toHaveBeenCalled();
  } finally {
    controller.detachMedia();
    controller.detachFeeder();
    feeder.destroy();
  }
});
