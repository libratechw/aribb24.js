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
