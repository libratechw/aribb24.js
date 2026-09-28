import { describe, expect, test, vi } from 'vitest';

import mux from '@/lib/muxer/b24/datagroup';
import { ARIBB24CaptionData, TimeControlModeType } from '@/lib/demuxer/b24/datagroup';
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
});
