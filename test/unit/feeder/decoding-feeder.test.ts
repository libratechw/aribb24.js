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
      feeder.prepare(3.1);
      feeder.content(3.2);
      await vi.waitFor(() => expect(feeder.content(3.2)?.pts).toBe(2.5));
    } finally {
      feeder.destroy();
    }
  });
});
