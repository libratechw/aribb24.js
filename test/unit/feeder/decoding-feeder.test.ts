import { describe, expect, test, vi } from 'vitest';

import mux from '@/lib/muxer/b24/datagroup';
import { ARIBB24CaptionData, RollupModeType, TimeControlModeType } from '@/lib/demuxer/b24/datagroup';
import MPEGTSFeeder from '@/runtime/browser/feeder/mpegts-feeder';

const management = {
  tag: 'CaptionManagement',
  group: 0,
  timeControlMode: TimeControlModeType.FREE,
  languages: [],
  units: [],
} as const satisfies ARIBB24CaptionData;
const packet = new Uint8Array([0x80, 0, 0, ...new Uint8Array(mux(management))]);

describe('DecodingFeeder late metadata', () => {
  test('does not retain an excluded page from a seek-only management context', async () => {
    const context = { ...management, languages: [{ lang: 0, displayMode: 0b0101,
      iso_639_language_code: 'jpn', format: 7, rollup: RollupModeType.NOT_ROLLUP, TCS: 1 }] } as const;
    const encode = (caption: ARIBB24CaptionData) => new Uint8Array([0x80, 0, 0, ...new Uint8Array(mux(caption))]);
    const statement = (character: number) => encode({ tag: 'CaptionStatement', group: 0, lang: 0,
      timeControlMode: TimeControlModeType.FREE, units: [{ tag: 'Statement', data: new Uint8Array([0x0c, character]) }] });
    const feeder = new MPEGTSFeeder();
    try {
      feeder.prepare(0);
      feeder.feedB24(encode(context), 0);
      feeder.feedB24(statement(0x41), 1);
      feeder.feedB24(encode(context), 3);
      feeder.feedB24(statement(0x42), 8);
      await vi.waitFor(() => expect(feeder.content(8.5)?.pts).toBe(8));
      feeder.onSeeking(); feeder.prepare(10.5, 10);
      await vi.waitFor(() => expect(feeder.content(10.5, 10)?.data.map(({ tag }) => tag)).toEqual(['ClearScreen']));
      feeder.prune(10); // The earlier buffered range has now been evicted.
      feeder.onSeeking(); feeder.prepare(10.5, 10);
      await vi.waitFor(() => expect(feeder.content(10.5, 10)?.data.map(({ tag }) => tag)).toEqual(['ClearScreen']));
      feeder.feedB24(statement(0x43), 11);
      await vi.waitFor(() => expect(feeder.content(11.5, 10)?.pts).toBe(11));
    } finally { feeder.destroy(); }
  });

  test.each([false, true])('retains the active page across a seek (separate range=%s)', async (separateRange) => {
    const context = { ...management, languages: [{ lang: 0, displayMode: 0b0101,
      iso_639_language_code: 'jpn', format: 7, rollup: RollupModeType.NOT_ROLLUP, TCS: 1 }] } as const;
    const encode = (caption: ARIBB24CaptionData) => new Uint8Array([0x80, 0, 0, ...new Uint8Array(mux(caption))]);
    const statement = (bytes: number[]) => encode({ tag: 'CaptionStatement', group: 0, lang: 0,
      timeControlMode: TimeControlModeType.FREE, units: [{ tag: 'Statement', data: new Uint8Array(bytes) }] });
    const feeder = new MPEGTSFeeder();
    try {
      feeder.prepare(0);
      feeder.feedB24(encode(context), 0);
      feeder.feedB24(statement([0x0c, 0x41]), 1, separateRange ? 1 : 0.7);
      feeder.feedB24(statement([0x42]), 2);
      feeder.feedB24(encode(context), 3);
      feeder.feedB24(statement([0x0c, 0x43]), 10);
      await vi.waitFor(() => expect(feeder.content(10.5)?.pts).toBe(10));
      feeder.prune(4);
      if (separateRange) {
        feeder.onSeeking(); feeder.prepare(10.5, 10);
        await vi.waitFor(() => expect(feeder.content(10.5, 10)?.pts).toBe(10));
        feeder.prune(4); // This boundary was not decoded in the later range.
      }
      feeder.onSeeking(); feeder.prepare(4.5, 4);
      await vi.waitFor(() => expect(feeder.content(4.5, 4)?.pts).toBe(2));
      expect(feeder.contentRange(null, 4.5)?.some(({ data }) => data.some((token) =>
        token.tag === 'Character' && token.character === 'A'))).toBe(true);
    } finally { feeder.destroy(); }
  });

  test('prunes expired live history while preserving the buffered page and management', async () => {
    const context = { ...management, languages: [{ lang: 0, displayMode: 0b0101,
      iso_639_language_code: 'jpn', format: 7, rollup: RollupModeType.NOT_ROLLUP, TCS: 1 }] } as const;
    const encode = (caption: ARIBB24CaptionData) => new Uint8Array([0x80, 0, 0, ...new Uint8Array(mux(caption))]);
    const statement = (clears: boolean) => encode({ tag: 'CaptionStatement', group: 0, lang: 0,
      timeControlMode: TimeControlModeType.FREE,
      units: [{ tag: 'Statement', data: new Uint8Array(clears ? [0x0c, 0x41] : [0x42]) }] });
    const feeder = new MPEGTSFeeder();
    try {
      feeder.prepare(0);
      for (let time = 0; time < 200; time++) {
        feeder.feedB24(encode(context), time);
        feeder.feedB24(statement(time % 10 === 0), time + 0.1);
      }
      await vi.waitFor(() => expect(feeder.content(199.5)?.pts).toBe(199.1));
      feeder.prune(195);
      expect(feeder.contentRange(1.1, 199.5)).toBeNull();
      expect(feeder.contentRange(null, 199.5)?.[0].pts).toBe(190.1);
      let packets = 0;
      (feeder as any).decoder.forEach(() => packets++);
      expect(packets).toBeLessThan(25);
      feeder.onSeeking();
      feeder.prepare(196, 195);
      await vi.waitFor(() => expect(feeder.content(196, 195)?.pts).toBe(195.1));
      expect(feeder.contentRange(null, 196)?.[0].pts).toBe(190);
      expect(feeder.contentRange(null, 196)?.[1].data.some((token) =>
        token.tag === 'Character' && token.character === 'A')).toBe(true);
      feeder.destroy();
      expect(feeder.contentRange(null, 200)).toEqual([]);
      packets = 0;
      (feeder as any).decoder.forEach(() => packets++);
      expect(packets).toBe(0);
    } finally { feeder.destroy(); }
  });

  test('does not prune an active append-only page or history without a known boundary', async () => {
    const context = { ...management, languages: [{ lang: 0, displayMode: 0b0101,
      iso_639_language_code: 'jpn', format: 7, rollup: RollupModeType.NOT_ROLLUP, TCS: 1 }] } as const;
    const encode = (caption: ARIBB24CaptionData) => new Uint8Array([0x80, 0, 0, ...new Uint8Array(mux(caption))]);
    const feeder = new MPEGTSFeeder();
    try {
      feeder.prepare(0);
      feeder.feedB24(encode(context), 0);
      for (let time = 1; time <= 10; time++) {
        feeder.feedB24(encode({ tag: 'CaptionStatement', group: 0, lang: 0,
          timeControlMode: TimeControlModeType.FREE,
          units: [{ tag: 'Statement', data: new Uint8Array(time === 1 ? [0x0c, 0x41] : [0x42]) }] }), time);
      }
      await vi.waitFor(() => expect(feeder.content(10)?.pts).toBe(10));
      feeder.prune(Number.NaN);
      feeder.prune(100); // Not yet passed by the media clock.
      expect(feeder.contentRange(null, 10)).toHaveLength(11);
      feeder.prune(8);
      expect(feeder.contentRange(null, 10)?.map(({ pts }) => pts)).toEqual([1,2,3,4,5,6,7,8,9,10]);
      feeder.onSeeking(); feeder.prepare(5, 1);
      await vi.waitFor(() => expect(feeder.content(5, 1)?.pts).toBe(5));
    } finally { feeder.destroy(); }
  });

  test.each([false, true])('restores an active statement across repeated management (out of order=%s)', async (outOfOrder) => {
    const context = { ...management, languages: [{ lang: 0, displayMode: 0b0101,
      iso_639_language_code: 'jpn', format: 7, rollup: RollupModeType.NOT_ROLLUP, TCS: 1 }] } as const;
    const statement = { tag: 'CaptionStatement', group: 0, lang: 0,
      timeControlMode: TimeControlModeType.FREE,
      units: [{ tag: 'Statement', data: new Uint8Array([0x0c, 0x41]) }] } as const;
    const encode = (caption: ARIBB24CaptionData) => new Uint8Array([0x80, 0, 0, ...new Uint8Array(mux(caption))]);
    const feeder = new MPEGTSFeeder();
    try {
      feeder.prepare(0);
      if (outOfOrder) { feeder.feedB24(encode(context), 2); }
      feeder.feedB24(encode(context), 0);
      feeder.feedB24(encode(statement), 1);
      if (!outOfOrder) { feeder.feedB24(encode(context), 2); }
      await vi.waitFor(() => expect(feeder.content(3)?.pts).toBe(1));
      feeder.onSeeking();
      feeder.prepare(4, 0);
      await vi.waitFor(() => expect(feeder.content(4, 0)?.data.some((token) =>
        token.tag === 'Character' && token.character === 'A')).toBe(true));
    } finally { feeder.destroy(); }
  });

  test('returns retained decoded cues in order and invalidates the range anchor after seeking', async () => {
    const feeder = new MPEGTSFeeder();
    try {
      feeder.prepare(1);
      feeder.content(3);
      feeder.feedB24(packet, 1);
      feeder.feedB24(new Uint8Array([0x80, 0, 0, ...new Uint8Array(mux({ ...management, group: 1 }))]), 2);
      feeder.feedB24(packet, 3);
      await vi.waitFor(() => expect(feeder.content(3)?.pts).toBe(3));
      expect(feeder.contentRange(1, 3)?.map(({ pts }) => pts)).toEqual([2, 3]);
      expect(feeder.contentRange(null, 3)?.map(({ pts }) => pts)).toEqual([1, 2, 3]);
      expect(feeder.contentRange(0, 3)).toBeNull();
      feeder.onSeeking();
      expect(feeder.contentRange(1, 3)).toBeNull();
    } finally {
      feeder.destroy();
    }
  });

  test('decodes data that arrives after the media clock passed its DTS', async () => {
    const feeder = new MPEGTSFeeder();
    try {
      feeder.prepare(2);
      feeder.content(2.1);
      feeder.feedB24(packet, 2.05);
      await vi.waitFor(() => expect(feeder.content(2.2)?.pts).toBe(2.05));
    } finally {
      feeder.destroy();
    }
  });

  test('decodes a cue arriving exactly at a paused media clock', async () => {
    const feeder = new MPEGTSFeeder();
    try {
      feeder.prepare(2);
      feeder.content(2);
      const changed = vi.fn();
      feeder.setPresentationChangeHandler(changed);
      feeder.feedB24(packet, 2);
      await vi.waitFor(() => expect(changed).toHaveBeenCalledOnce());
      expect(feeder.content(2)?.pts).toBe(2);
    } finally {
      feeder.destroy();
    }
  });

  test('retries a same-time statement that arrived before its management packet', async () => {
    const managementWithLanguage = {
      ...management,
      languages: [{ lang: 0, displayMode: 0b0101, iso_639_language_code: 'jpn',
        format: 7, rollup: RollupModeType.NOT_ROLLUP, TCS: 0b00 }],
    } as const satisfies ARIBB24CaptionData;
    const statement = {
      tag: 'CaptionStatement', group: 0, lang: 0,
      timeControlMode: TimeControlModeType.FREE, units: [],
    } as const satisfies ARIBB24CaptionData;
    const makePacket = (caption: ARIBB24CaptionData) =>
      new Uint8Array([0x80, 0, 0, ...new Uint8Array(mux(caption))]);
    const feeder = new MPEGTSFeeder();
    try {
      feeder.prepare(2);
      feeder.content(2);
      feeder.feedB24(makePacket(statement), 2);
      await new Promise<void>((resolve) => setImmediate(resolve));
      feeder.feedB24(makePacket(managementWithLanguage), 2);
      await vi.waitFor(() => expect(feeder.content(2)?.data).toEqual([]));
    } finally {
      feeder.destroy();
    }
  });

  test('waits for a new management group before decoding its same-time statement', async () => {
    const baseManagement = {
      ...management,
      languages: [{ lang: 0, displayMode: 0b0101, iso_639_language_code: 'jpn',
        format: 7, rollup: RollupModeType.NOT_ROLLUP, TCS: 0b00 }],
    } as const satisfies ARIBB24CaptionData;
    const nextManagement = { ...baseManagement, group: 1 as const };
    const statement = {
      tag: 'CaptionStatement', group: 1, lang: 0,
      timeControlMode: TimeControlModeType.FREE, units: [],
    } as const satisfies ARIBB24CaptionData;
    const makePacket = (caption: ARIBB24CaptionData) =>
      new Uint8Array([0x80, 0, 0, ...new Uint8Array(mux(caption))]);
    const feeder = new MPEGTSFeeder();
    try {
      feeder.prepare(1);
      feeder.feedB24(makePacket(baseManagement), 1);
      await vi.waitFor(() => expect(feeder.content(1)?.pts).toBe(1));
      feeder.content(2);
      feeder.feedB24(makePacket(statement), 2);
      await new Promise<void>((resolve) => setImmediate(resolve));
      feeder.feedB24(makePacket(nextManagement), 2);
      await vi.waitFor(() => expect(feeder.content(2)?.data).toEqual([]));
    } finally {
      feeder.destroy();
    }
  });

  test('keeps a pending statement when another management group arrives first', async () => {
    const baseManagement = {
      ...management,
      languages: [{ lang: 0, displayMode: 0b0101, iso_639_language_code: 'jpn',
        format: 7, rollup: RollupModeType.NOT_ROLLUP, TCS: 0b00 }],
    } as const satisfies ARIBB24CaptionData;
    const nextManagement = { ...baseManagement, group: 1 as const };
    const statement = {
      tag: 'CaptionStatement', group: 1, lang: 0,
      timeControlMode: TimeControlModeType.FREE, units: [],
    } as const satisfies ARIBB24CaptionData;
    const makePacket = (caption: ARIBB24CaptionData) =>
      new Uint8Array([0x80, 0, 0, ...new Uint8Array(mux(caption))]);
    const feeder = new MPEGTSFeeder();
    try {
      feeder.prepare(2);
      feeder.content(3);
      feeder.feedB24(makePacket(statement), 2.2);
      await new Promise<void>((resolve) => setImmediate(resolve));
      feeder.feedB24(makePacket(baseManagement), 2);
      await vi.waitFor(() => expect(feeder.content(3)?.pts).toBe(2));
      feeder.feedB24(makePacket(nextManagement), 2.1);
      await vi.waitFor(() => expect(feeder.content(3)?.pts).toBe(2.2));
      expect(feeder.content(3)?.data).toEqual([]);
    } finally {
      feeder.destroy();
    }
  });

  test('keeps normal in-order data on the time-based path', async () => {
    const feeder = new MPEGTSFeeder();
    try {
      feeder.prepare(2);
      feeder.feedB24(packet, 2.15);
      feeder.content(2.2);
      await vi.waitFor(() => expect(feeder.content(2.3)?.pts).toBe(2.15));
    } finally {
      feeder.destroy();
    }
  });

  test('does not decode the same late cue twice when a segment is replayed', () => {
    const feeder = new MPEGTSFeeder();
    try {
      feeder.prepare(2);
      feeder.content(2.1);
      const notify = vi.spyOn(feeder as any, 'notify');
      feeder.feedB24(packet, 2.05);
      feeder.feedB24(packet, 2.05);
      expect(notify).toHaveBeenCalledTimes(1);
    } finally {
      feeder.destroy();
    }
  });

  test('decodes a changed packet at a previously notified DTS', async () => {
    const feeder = new MPEGTSFeeder();
    try {
      feeder.prepare(2);
      feeder.content(2);
      feeder.feedB24(packet, 2);
      await vi.waitFor(() => expect(feeder.content(2)?.pts).toBe(2));
      const first = feeder.content(2);
      const replacement = new Uint8Array([0x80, 0, 0, ...new Uint8Array(mux({
        ...management, group: 1,
      }))]);
      feeder.feedB24(replacement, 2);
      await vi.waitFor(() => expect(feeder.content(2)).not.toBe(first));
      expect(feeder.content(2)?.pts).toBe(2);
    } finally {
      feeder.destroy();
    }
  });

  test('a previously stored but not decoded cue can still be delivered late', () => {
    const feeder = new MPEGTSFeeder();
    try {
      feeder.feedB24(packet, 2.05);
      feeder.prepare(2.1);
      const notify = vi.spyOn(feeder as any, 'notify');
      feeder.feedB24(packet, 2.05);
      expect(notify).toHaveBeenCalledTimes(1);
    } finally {
      feeder.destroy();
    }
  });

  test('does not lose a new cue delivered immediately after seeking', async () => {
    const feeder = new MPEGTSFeeder();
    try {
      feeder.onSeeking();
      feeder.prepare(2.1);
      feeder.feedB24(packet, 2.05);
      await vi.waitFor(() => expect(feeder.content(2.2)?.pts).toBe(2.05));
    } finally {
      feeder.destroy();
    }
  });

  test('replays received management from the seek target, including when play prepares the feeder', () => {
    const feeder = new MPEGTSFeeder();
    try {
      feeder.prepare(0);
      feeder.feedB24(packet, 2);
      feeder.feedB24(packet, 8);
      feeder.content(8.2);

      feeder.onSeeking();
      const notify = vi.spyOn(feeder as any, 'notify');
      feeder.prepare(8.5); // Controller.onPlay() runs before the next paint.
      feeder.content(8.6);
      expect(notify.mock.calls.filter(([segment]) => segment != null).map(([segment]) => segment.pts)).toEqual([8]);
    } finally {
      feeder.destroy();
    }
  });

  test('replays received management on a paused seek without a play event', () => {
    const feeder = new MPEGTSFeeder();
    try {
      feeder.prepare(0);
      feeder.feedB24(packet, 2);
      feeder.content(2.2);

      feeder.onSeeking();
      const notify = vi.spyOn(feeder as any, 'notify');
      feeder.content(2.5);
      expect(notify.mock.calls.filter(([segment]) => segment != null).map(([segment]) => segment.pts)).toEqual([2]);
    } finally {
      feeder.destroy();
    }
  });

  test('restores an already received statement after seeking within buffered media', async () => {
    const managementWithLanguage = {
      ...management,
      languages: [{ lang: 0, displayMode: 0b0101, iso_639_language_code: 'jpn',
        format: 7, rollup: RollupModeType.NOT_ROLLUP, TCS: 0b00 }],
    } as const satisfies ARIBB24CaptionData;
    const statement = {
      tag: 'CaptionStatement', group: 0, lang: 0,
      timeControlMode: TimeControlModeType.FREE, units: [],
    } as const satisfies ARIBB24CaptionData;
    const makePacket = (caption: ARIBB24CaptionData) => new Uint8Array([0x80, 0, 0, ...new Uint8Array(mux(caption))]);
    const feeder = new MPEGTSFeeder();
    try {
      feeder.prepare(0);
      feeder.feedB24(makePacket(managementWithLanguage), 2);
      feeder.feedB24(makePacket(statement), 2.5);
      feeder.content(3);
      await vi.waitFor(() => expect(feeder.content(3)?.pts).toBe(2.5));

      feeder.onSeeking();
      feeder.prepare(3.1, 2);
      feeder.content(3.2, 2);
      await vi.waitFor(() => expect(feeder.content(3.2, 2)?.pts).toBe(2.5));
    } finally {
      feeder.destroy();
    }
  });

  test('does not restore an old statement after seeking into a separate buffered range', async () => {
    const managementWithLanguage = {
      ...management,
      languages: [{ lang: 0, displayMode: 0b0101, iso_639_language_code: 'jpn',
        format: 7, rollup: RollupModeType.NOT_ROLLUP, TCS: 0b00 }],
    } as const satisfies ARIBB24CaptionData;
    const statement = {
      tag: 'CaptionStatement', group: 0, lang: 0,
      timeControlMode: TimeControlModeType.FREE, units: [],
    } as const satisfies ARIBB24CaptionData;
    const makePacket = (caption: ARIBB24CaptionData) => new Uint8Array([0x80, 0, 0, ...new Uint8Array(mux(caption))]);
    const feeder = new MPEGTSFeeder();
    try {
      feeder.prepare(0);
      feeder.feedB24(makePacket(managementWithLanguage), 2);
      feeder.feedB24(makePacket(statement), 2.5);
      feeder.content(3);
      await vi.waitFor(() => expect(feeder.content(3)?.pts).toBe(2.5));

      feeder.onSeeking();
      feeder.prepare(1000, null);
      expect(feeder.content(1000, null)).toBeNull();
      feeder.prepare(1000, 999);
      feeder.content(1000, 999);
      await new Promise<void>((resolve) => setImmediate(resolve));
      expect(feeder.content(1000, 999)?.data.map((token) => token.tag)).toEqual(['ClearScreen']);

      feeder.feedB24(makePacket(statement), 998.9);
      feeder.onSeeking();
      feeder.prepare(1000, 999);
      await vi.waitFor(() => expect(feeder.content(1000, 999)?.pts).toBe(998.9));

      feeder.onSeeking();
      feeder.prepare(3, 2);
      feeder.prepare(3, 2); // A play event must not discard the pending replay window.
      await vi.waitFor(() => expect(feeder.content(3, 2)?.pts).toBe(2.5));

      feeder.onSeeking();
      feeder.prepare(3, 2);
      feeder.onSeeking(); // A second seek supersedes the unread first window.
      feeder.prepare(1000, 999);
      await vi.waitFor(() => expect(feeder.content(1000, 999)?.pts).toBe(998.9));
    } finally {
      feeder.destroy();
    }
  });

  test('does not replay a distant statement when a direct caller omits bufferedStart', async () => {
    const managementWithLanguage = {
      ...management,
      languages: [{ lang: 0, displayMode: 0b0101, iso_639_language_code: 'jpn',
        format: 7, rollup: RollupModeType.NOT_ROLLUP, TCS: 0b00 }],
    } as const satisfies ARIBB24CaptionData;
    const statement = {
      tag: 'CaptionStatement', group: 0, lang: 0,
      timeControlMode: TimeControlModeType.FREE, units: [],
    } as const satisfies ARIBB24CaptionData;
    const makePacket = (caption: ARIBB24CaptionData) =>
      new Uint8Array([0x80, 0, 0, ...new Uint8Array(mux(caption))]);
    const feeder = new MPEGTSFeeder();
    try {
      feeder.prepare(0);
      feeder.feedB24(makePacket(managementWithLanguage), 2);
      feeder.feedB24(makePacket(statement), 2.5);
      await vi.waitFor(() => expect(feeder.content(3)?.pts).toBe(2.5));

      feeder.onSeeking();
      feeder.prepare(1000);
      await vi.waitFor(() => expect(feeder.content(1000)?.data.map((token) => token.tag)).toEqual(['ClearScreen']));
    } finally {
      feeder.destroy();
    }
  });
});
