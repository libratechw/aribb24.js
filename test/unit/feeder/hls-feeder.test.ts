import { afterEach, describe, expect, test, vi } from 'vitest';

import HLSFeeder from '@/runtime/browser/feeder/hls-feeder';
import mux from '@/lib/muxer/b24/datagroup';
import { ARIBB24CaptionData, RollupModeType, TimeControlModeType } from '@/lib/demuxer/b24/datagroup';

afterEach(() => vi.unstubAllGlobals());

const buffered = (start: number, end: number): TimeRanges => ({
  length: 1,
  start: () => start,
  end: () => end,
}) as TimeRanges;

describe('HLSFeeder media lifetime', () => {
  test('enables native ID3 cues while attached and restores the prior track mode', () => {
    const cue = { startTime: 1 } as TextTrackCue;
    let mode: TextTrackMode = 'disabled';
    const track = {
      kind: 'metadata', inBandMetadataTrackDispatchType: 'com.apple.streaming',
      get mode() { return mode; },
      set mode(value: TextTrackMode) { mode = value; },
      get cues() { return mode === 'disabled' ? null : [cue]; },
    } as TextTrack;
    const textTracks = Object.assign(new EventTarget(), { 0: track, length: 1 });
    const media = Object.assign(new EventTarget(), {
      currentTime: 0, paused: true, buffered: buffered(0, 2), textTracks,
    }) as unknown as HTMLVideoElement;
    const feeder = new HLSFeeder();

    feeder.attachMedia(media);
    expect(track.mode).toBe('hidden');
    expect(track.cues?.length).toBe(1);
    feeder.destroy();
    expect(track.mode).toBe('disabled');

    mode = 'hidden';
    const alreadyEnabled = new HLSFeeder();
    alreadyEnabled.attachMedia(media);
    alreadyEnabled.destroy();
    expect(track.mode).toBe('hidden');

    mode = 'disabled';
    const changedElsewhere = new HLSFeeder();
    changedElsewhere.attachMedia(media);
    mode = 'showing';
    changedElsewhere.destroy();
    expect(track.mode).toBe('showing');
  });

  test('enables a metadata track added after media attachment and restores it on removal', () => {
    let mode: TextTrackMode = 'disabled';
    const track = {
      kind: 'metadata', inBandMetadataTrackDispatchType: 'com.apple.streaming',
      get mode() { return mode; },
      set mode(value: TextTrackMode) { mode = value; },
      get cues() { return mode === 'disabled' ? null : []; },
    } as TextTrack;
    const textTracks = Object.assign(new EventTarget(), { length: 0 });
    const media = Object.assign(new EventTarget(), {
      currentTime: 0, paused: true, buffered: buffered(0, 2), textTracks,
    }) as unknown as HTMLVideoElement;
    const feeder = new HLSFeeder();

    feeder.attachMedia(media);
    textTracks.dispatchEvent(Object.assign(new Event('addtrack'), { track }));
    expect(track.mode).toBe('hidden');
    textTracks.dispatchEvent(Object.assign(new Event('removetrack'), { track }));
    expect(track.mode).toBe('disabled');
    feeder.destroy();
  });

  test('keeps a shared Safari track enabled until the last feeder detaches', () => {
    const track = {
      kind: 'metadata', inBandMetadataTrackDispatchType: 'com.apple.streaming',
      mode: 'disabled', cues: [],
    } as unknown as TextTrack;
    const textTracks = Object.assign(new EventTarget(), { 0: track, length: 1 });
    const media = Object.assign(new EventTarget(), {
      currentTime: 0, paused: true, buffered: buffered(0, 2), textTracks,
    }) as unknown as HTMLVideoElement;
    const caption = new HLSFeeder();
    const superimpose = new HLSFeeder();

    caption.attachMedia(media);
    superimpose.attachMedia(media);
    expect(track.mode).toBe('hidden');
    caption.destroy();
    expect(track.mode).toBe('hidden');
    superimpose.destroy();
    expect(track.mode).toBe('disabled');
  });

  test('reenables a shared Safari track disabled between feeder attachments', () => {
    const track = {
      kind: 'metadata', inBandMetadataTrackDispatchType: 'com.apple.streaming',
      mode: 'disabled', cues: [],
    } as unknown as TextTrack;
    const textTracks = Object.assign(new EventTarget(), { 0: track, length: 1 });
    const media = Object.assign(new EventTarget(), {
      currentTime: 0, paused: true, buffered: buffered(0, 2), textTracks,
    }) as unknown as HTMLVideoElement;
    const caption = new HLSFeeder();
    const superimpose = new HLSFeeder();

    caption.attachMedia(media);
    track.mode = 'disabled';
    superimpose.attachMedia(media);
    expect(track.mode).toBe('hidden');
    caption.destroy();
    expect(track.mode).toBe('hidden');
    superimpose.destroy();
    expect(track.mode).toBe('disabled');
  });

  test('restores a Safari track added after attachment when the feeder detaches', () => {
    const track = {
      kind: 'metadata', inBandMetadataTrackDispatchType: 'com.apple.streaming',
      mode: 'disabled', cues: [],
    } as unknown as TextTrack;
    const textTracks = Object.assign(new EventTarget(), { length: 0 });
    const media = Object.assign(new EventTarget(), {
      currentTime: 0, paused: true, buffered: buffered(0, 2), textTracks,
    }) as unknown as HTMLVideoElement;
    const feeder = new HLSFeeder();

    feeder.attachMedia(media);
    textTracks.dispatchEvent(Object.assign(new Event('addtrack'), { track }));
    expect(track.mode).toBe('hidden');
    feeder.destroy();
    expect(track.mode).toBe('disabled');
  });

  test('does not change a disabled non-Safari ID3 track', () => {
    const track = { kind: 'metadata', label: 'id3', mode: 'disabled', cues: [] } as unknown as TextTrack;
    const textTracks = Object.assign(new EventTarget(), { 0: track, length: 1 });
    const media = Object.assign(new EventTarget(), {
      currentTime: 0, paused: true, buffered: buffered(0, 2), textTracks,
    }) as unknown as HTMLVideoElement;
    const feeder = new HLSFeeder();

    feeder.attachMedia(media);
    expect(track.mode).toBe('disabled');
    feeder.destroy();
    expect(track.mode).toBe('disabled');
  });

  test('feeds a native cue exposed only while the Safari track is hidden', () => {
    const pending = new Map<number, FrameRequestCallback>();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      pending.set(1, callback);
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => pending.delete(id));
    let mode: TextTrackMode = 'disabled';
    const track = {
      kind: 'metadata', inBandMetadataTrackDispatchType: 'com.apple.streaming',
      get mode() { return mode; },
      set mode(value: TextTrackMode) { mode = value; },
      get cues() { return mode === 'disabled' ? null : [{
        startTime: 1, track: track as unknown as TextTrack,
        value: { key: 'PRIV', info: 'aribb24.js', data: new Uint8Array([0x80]) },
      }]; },
    } as TextTrack;
    const textTracks = Object.assign(new EventTarget(), { 0: track, length: 1 });
    const media = Object.assign(new EventTarget(), {
      currentTime: 1.1, paused: false, seeking: false, buffered: buffered(0, 2), textTracks,
    }) as unknown as HTMLVideoElement;
    const feeder = new HLSFeeder();
    const received: number[] = [];
    (feeder as unknown as { feed(data: Uint8Array, pts: number, dts: number): void }).feed = (_data, pts) => {
      received.push(pts);
    };

    try {
      feeder.attachMedia(media);
      pending.get(1)!(0);
      expect(received).toEqual([1]);
    } finally {
      feeder.destroy();
    }
    expect(track.mode).toBe('disabled');
  });

  test('scans buffered ID3 once after a paused seek without starting rAF', () => {
    const pending = new Map<number, FrameRequestCallback>();
    let nextId = 1;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      const id = nextId++;
      pending.set(id, callback);
      return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => pending.delete(id));
    const track = {
      kind: 'metadata', inBandMetadataTrackDispatchType: 'com.apple.streaming',
      cues: [] as TextTrackCue[],
    };
    track.cues.push({
      startTime: 10.2, track: track as unknown as TextTrack,
      value: {key: 'PRIV', info: 'aribb24.js', data: new Uint8Array([0x80])},
    } as unknown as TextTrackCue);
    const media = Object.assign(new EventTarget(), {
      currentTime: 10.5, paused: true, seeking: false, buffered: buffered(10, 12),
      textTracks: Object.assign(new EventTarget(), {0: track, length: 1}),
    }) as unknown as HTMLVideoElement;
    const feeder = new HLSFeeder();
    const received: number[] = [];
    (feeder as unknown as {feed(data: Uint8Array, pts: number, dts: number): void}).feed = (_data, pts) => {
      received.push(pts);
    };
    try {
      feeder.attachMedia(media);
      feeder.onSeeking();
      feeder.onSeeked();
      expect(received).toEqual([10.2]);
      expect(pending.size).toBe(0);
    } finally {
      feeder.destroy();
    }
  });

  test('scans a paused seek target when its media arrives after seeked', () => {
    const pending = new Map<number, FrameRequestCallback>();
    let nextId = 1;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      const id = nextId++;
      pending.set(id, callback);
      return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => pending.delete(id));
    const track = {
      kind: 'metadata', inBandMetadataTrackDispatchType: 'com.apple.streaming',
      cues: [] as TextTrackCue[],
    };
    let ranges = [[0, 10]];
    const media = Object.assign(new EventTarget(), {
      currentTime: 1000, paused: true, seeking: false,
      buffered: {
        get length() { return ranges.length; },
        start: (index: number) => ranges[index][0],
        end: (index: number) => ranges[index][1],
      } as TimeRanges,
      textTracks: Object.assign(new EventTarget(), {0: track, length: 1}),
    }) as unknown as HTMLVideoElement;
    const feeder = new HLSFeeder();
    const received: number[] = [];
    (feeder as unknown as {feed(data: Uint8Array, pts: number, dts: number): void}).feed = (_data, pts) => {
      received.push(pts);
    };
    try {
      feeder.attachMedia(media);
      feeder.onSeeking();
      feeder.onSeeked();
      expect(received).toEqual([]);
      track.cues.push({
        startTime: 999.5, track: track as unknown as TextTrack,
        value: {key: 'PRIV', info: 'aribb24.js', data: new Uint8Array([0x80])},
      } as unknown as TextTrackCue);
      ranges = [[0, 10], [999, 1002]];
      media.dispatchEvent(new Event('progress'));
      expect(received).toEqual([999.5]);
      expect(pending.size).toBe(0);
    } finally {
      feeder.destroy();
    }
  });

  test('keeps captions crossed during a short buffer gap, including a late cue', () => {
    const pending = new Map<number, FrameRequestCallback>();
    let nextId = 1;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      const id = nextId++;
      pending.set(id, callback);
      return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => pending.delete(id));
    const track = {
      kind: 'metadata', inBandMetadataTrackDispatchType: 'com.apple.streaming',
      cues: [] as TextTrackCue[],
    };
    const addCue = (startTime: number) => track.cues.push({
      startTime, track: track as unknown as TextTrack,
      value: { key: 'PRIV', info: 'aribb24.js', data: new Uint8Array([0x80]) },
    } as unknown as TextTrackCue);
    addCue(10);
    let ranges = [[0, 10.00], [10.02, 10.055], [10.08, 11]];
    const media = Object.assign(new EventTarget(), {
      currentTime: 9.99,
      seeking: false,
      buffered: {
        get length() { return ranges.length; },
        start: (index: number) => ranges[index][0],
        end: (index: number) => ranges[index][1],
      } as TimeRanges,
      textTracks: Object.assign(new EventTarget(), { 0: track, length: 1 }),
    }) as unknown as HTMLVideoElement;
    const feeder = new HLSFeeder();
    const received: number[] = [];
    (feeder as unknown as { feed(data: Uint8Array, pts: number, dts: number): void }).feed = (_data, pts) => {
      received.push(pts);
    };
    const runFrame = () => {
      const [id, callback] = pending.entries().next().value!;
      pending.delete(id);
      callback(0);
    };
    try {
      feeder.attachMedia(media);
      media.dispatchEvent(new Event('play'));
      runFrame();
      media.currentTime = 10.01;
      runFrame(); // Buffer gap: do not discard the previous cue time.
      media.currentTime = 10.05;
      runFrame();
      expect(received).toEqual([10]);

      media.currentTime = 10.06;
      runFrame();
      addCue(10.055); // Cue list changes while the playhead is in the next gap.
      media.currentTime = 10.09;
      runFrame();
      expect(received).toEqual([10, 10.055]);
    } finally {
      feeder.destroy();
    }
  });

  test('does not restore captions from an old buffer after seeking outside it', async () => {
    const pending = new Map<number, FrameRequestCallback>();
    let nextId = 1;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      const id = nextId++;
      pending.set(id, callback);
      return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => pending.delete(id));
    const management = {
      tag: 'CaptionManagement', group: 0, timeControlMode: TimeControlModeType.FREE,
      languages: [{ lang: 0, displayMode: 0b0101, iso_639_language_code: 'jpn',
        format: 7, rollup: RollupModeType.NOT_ROLLUP, TCS: 0b00 }], units: [],
    } as const satisfies ARIBB24CaptionData;
    const statement = {
      tag: 'CaptionStatement', group: 0, lang: 0,
      timeControlMode: TimeControlModeType.FREE, units: [],
    } as const satisfies ARIBB24CaptionData;
    const track = {
      kind: 'metadata', inBandMetadataTrackDispatchType: 'com.apple.streaming',
      cues: [] as TextTrackCue[],
    };
    const addCue = (startTime: number, caption: ARIBB24CaptionData) => {
      track.cues.push({
        startTime, track: track as unknown as TextTrack,
        value: { key: 'PRIV', info: 'aribb24.js', data: new Uint8Array([
          0x80, 0, 0, ...new Uint8Array(mux(caption)),
        ]) },
      } as unknown as TextTrackCue);
    };
    addCue(0, management);
    addCue(600, statement);
    let ranges = [[0, 601]];
    const media = Object.assign(new EventTarget(), {
      currentTime: 0,
      buffered: {
        get length() { return ranges.length; },
        start: (index: number) => ranges[index][0],
        end: (index: number) => ranges[index][1],
      } as TimeRanges,
      textTracks: Object.assign(new EventTarget(), { 0: track, length: 1 }),
    }) as unknown as HTMLVideoElement;
    const feeder = new HLSFeeder();
    const runFrame = () => {
      const [id, callback] = pending.entries().next().value!;
      pending.delete(id);
      callback(0);
    };
    try {
      feeder.attachMedia(media);
      media.dispatchEvent(new Event('play'));
      runFrame();
      await vi.waitFor(() => expect(feeder.content(0.1)?.pts).toBe(0));
      media.currentTime = 600.1;
      runFrame();
      await vi.waitFor(() => expect(feeder.content(600.1)?.pts).toBe(600));

      feeder.onSeeking();
      media.currentTime = 1800;
      runFrame(); // The target is not buffered yet.
      expect(feeder.content(1800)).toBeNull();
      ranges = [[0, 601], [1799, 1820]];
      runFrame(); // Only old cues are available in the track.
      expect(feeder.content(1800)).toBeNull();

      addCue(1799.5, management);
      addCue(1800.05, statement);
      media.currentTime = 1800.1;
      runFrame();
      await vi.waitFor(() => expect(feeder.content(1800.1)?.pts).toBe(1800.05));
    } finally {
      feeder.destroy();
    }
  });

  test('restores the statement after a backward seek when HLS runs before the controller', async () => {
    const pending = new Map<number, FrameRequestCallback>();
    let nextId = 1;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      const id = nextId++;
      pending.set(id, callback);
      return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => pending.delete(id));

    const management = {
      tag: 'CaptionManagement', group: 0, timeControlMode: TimeControlModeType.FREE,
      languages: [{ lang: 0, displayMode: 0b0101, iso_639_language_code: 'jpn',
        format: 7, rollup: RollupModeType.NOT_ROLLUP, TCS: 0b00 }],
      units: [],
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
      value: { key: 'PRIV', info: 'aribb24.js', data: new Uint8Array([
        0x80, 0, 0, ...new Uint8Array(mux(caption as ARIBB24CaptionData)),
      ]) },
    })) as unknown as TextTrackCue[]);
    const media = Object.assign(new EventTarget(), {
      currentTime: 0,
      buffered: buffered(0, 4),
      textTracks: Object.assign(new EventTarget(), { 0: track, length: 1 }),
    }) as unknown as HTMLVideoElement;
    const feeder = new HLSFeeder();
    const runFrame = () => {
      const [id, callback] = pending.entries().next().value!;
      pending.delete(id);
      callback(0);
    };
    try {
      feeder.attachMedia(media);
      media.dispatchEvent(new Event('play'));
      runFrame();
      await vi.waitFor(() => expect(feeder.content(0.1)?.pts).toBe(0));
      media.currentTime = 1.5;
      runFrame();
      await vi.waitFor(() => expect(feeder.content(1.5)?.pts).toBe(1));

      feeder.onSeeking();
      media.currentTime = 0.5;
      runFrame(); // HLS rAF runs before the controller calls content().
      await vi.waitFor(() => expect(feeder.content(0.5)?.pts).toBe(0));
      feeder.onSeeking();
      media.currentTime = 1.5;
      runFrame();
      await vi.waitFor(() => expect(feeder.content(1.5)?.pts).toBe(1));
    } finally {
      feeder.destroy();
    }
  });

  test.each([
    { name: 'Safari native HLS', label: '', dispatchType: 'com.apple.streaming' },
    { name: 'hls.js ID3', label: 'id3', dispatchType: undefined },
  ])('replays $name metadata in order on attach and after a backward seek', ({ label, dispatchType }) => {
    const pending = new Map<number, FrameRequestCallback>();
    let nextId = 1;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      const id = nextId++;
      pending.set(id, callback);
      return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => pending.delete(id));
    const track = {
      kind: 'metadata', label, inBandMetadataTrackDispatchType: dispatchType,
      cues: [] as TextTrackCue[],
    };
    track.cues.push(...[0, 1, 2, 3].map((startTime) => ({
      startTime, track: track as unknown as TextTrack,
      value: { key: 'PRIV', info: 'aribb24.js', data: new Uint8Array([0x80]) },
    })) as unknown as TextTrackCue[]);
    const media = Object.assign(new EventTarget(), {
      currentTime: 1.5,
      buffered: buffered(0, 4),
      textTracks: Object.assign(new EventTarget(), { 0: track, length: 1 }),
    }) as unknown as HTMLVideoElement;
    const feeder = new HLSFeeder();
    const order: number[] = [];
    (feeder as unknown as { feed(data: Uint8Array, pts: number, dts: number): void }).feed = (_data, pts) => {
      order.push(pts);
    };
    const runFrame = () => {
      const [id, callback] = pending.entries().next().value!;
      pending.delete(id);
      callback(0);
    };
    try {
      feeder.attachMedia(media);
      media.dispatchEvent(new Event('play'));
      runFrame();
      expect(order).toEqual([0, 1]);

      media.currentTime = 3.1;
      runFrame();
      order.length = 0;
      feeder.onSeeking();
      media.currentTime = 1.5;
      runFrame();
      expect(order).toEqual([0, 1]);
    } finally {
      feeder.destroy();
    }
  });

  test('feeds metadata crossed in one frame in chronological order', () => {
    const pending = new Map<number, FrameRequestCallback>();
    let nextId = 1;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      const id = nextId++;
      pending.set(id, callback);
      return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => pending.delete(id));
    const track = {
      kind: 'metadata', inBandMetadataTrackDispatchType: 'com.apple.streaming',
      cues: [] as TextTrackCue[],
    };
    track.cues.push(...[1, 1.1].map((startTime) => ({
      startTime, track: track as unknown as TextTrack,
      value: { key: 'PRIV', info: 'aribb24.js', data: new Uint8Array([0x80]) },
    })) as unknown as TextTrackCue[]);
    const media = Object.assign(new EventTarget(), {
      currentTime: 0.1,
      buffered: buffered(0, 4),
      textTracks: Object.assign(new EventTarget(), { 0: track, length: 1 }),
    }) as unknown as HTMLVideoElement;
    const feeder = new HLSFeeder();
    const order: number[] = [];
    (feeder as unknown as { feed(data: Uint8Array, pts: number, dts: number): void }).feed = (_data, pts) => {
      order.push(pts);
    };
    const runFrame = () => {
      const [id, callback] = pending.entries().next().value!;
      pending.delete(id);
      callback(0);
    };
    try {
      feeder.attachMedia(media);
      media.dispatchEvent(new Event('play'));
      runFrame();
      media.currentTime = 1.2;
      runFrame();
      expect(order).toEqual([1, 1.1]);
    } finally {
      feeder.destroy();
    }
  });

  test('decodes native metadata discovered after content advanced past the cue time', async () => {
    const pending = new Map<number, FrameRequestCallback>();
    let nextId = 1;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      const id = nextId++;
      pending.set(id, callback);
      return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => pending.delete(id));

    const management = {
      tag: 'CaptionManagement', group: 0,
      timeControlMode: TimeControlModeType.FREE,
      languages: [], units: [],
    } as const satisfies ARIBB24CaptionData;
    const track = {
      kind: 'metadata', inBandMetadataTrackDispatchType: 'com.apple.streaming',
      cues: [] as TextTrackCue[],
    };
    track.cues.push(...[0, 1].map((startTime) => ({
      startTime, track: track as unknown as TextTrack,
      value: { key: 'PRIV', info: 'aribb24.js', data: new Uint8Array([
        0x80, 0, 0, ...new Uint8Array(mux({ ...management, group: startTime === 0 ? 0 : 1 })),
      ]) },
    })) as unknown as TextTrackCue[]);
    const textTracks = Object.assign(new EventTarget(), { 0: track, length: 1 });
    const media = Object.assign(new EventTarget(), {
      currentTime: 0,
      buffered: buffered(0, 4),
      textTracks,
    }) as unknown as HTMLVideoElement;
    const feeder = new HLSFeeder();
    const runFrame = () => {
      const [id, callback] = pending.entries().next().value!;
      pending.delete(id);
      callback(0);
    };
    try {
      feeder.attachMedia(media);
      feeder.prepare(0);
      media.dispatchEvent(new Event('play'));
      runFrame(); // establish the metadata observer's starting time
      media.currentTime = 1.1;
      feeder.content(1.1); // Controller's rAF has already advanced its clock
      runFrame(); // the native metadata feeder discovers the cue afterwards
      await vi.waitFor(() => expect(feeder.content(1.2)?.pts).toBe(1));
    } finally {
      feeder.destroy();
    }
  });

  test('cancels its inspection loop when the media is detached', () => {
    const pending = new Map<number, FrameRequestCallback>();
    let nextId = 1;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      const id = nextId++;
      pending.set(id, callback);
      return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => pending.delete(id));

    const media = Object.assign(new EventTarget(), {
      currentTime: 0,
      buffered: buffered(0, 4),
      textTracks: Object.assign(new EventTarget(), { length: 0 }),
    }) as unknown as HTMLVideoElement;
    const feeder = new HLSFeeder();
    feeder.attachMedia(media);
    media.dispatchEvent(new Event('play'));
    expect(pending.size).toBe(1);

    feeder.detachMedia();
    expect(pending.size).toBe(0);

    media.dispatchEvent(new Event('play'));
    expect(pending.size).toBe(0);
    feeder.destroy();
    expect((feeder as any).isDestroyed).toBe(true);
  });
});
