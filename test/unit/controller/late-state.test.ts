import { afterEach, expect, test, vi } from 'vitest';
import Controller from '@/runtime/browser/controller/controller';
import MPEGTSFeeder from '@/runtime/browser/feeder/mpegts-feeder';
import TextRenderer from '@/runtime/browser/renderer/text/text-renderer';
import mux from '@/lib/muxer/b24/datagroup';
import { ARIBB24CaptionData, RollupModeType, TimeControlModeType } from '@/lib/demuxer/b24/datagroup';

afterEach(() => vi.unstubAllGlobals());
const encode = (caption: ARIBB24CaptionData) => new Uint8Array([0x80, 0, 0, ...new Uint8Array(mux(caption))]);
const management = (group = 0) => encode({ tag: 'CaptionManagement', group,
  timeControlMode: TimeControlModeType.FREE,
  languages: [{ lang: 0, displayMode: 0b0101, iso_639_language_code: 'jpn', format: 7,
    rollup: RollupModeType.NOT_ROLLUP, TCS: 1 }], units: [] });
const statement = (bytes: number[], group = 0) => encode({ tag: 'CaptionStatement', group, lang: 0,
  timeControlMode: TimeControlModeType.FREE, units: [{ tag: 'Statement', data: new Uint8Array(bytes) }] });

function setup() {
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => {});
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  const media = Object.assign(new EventTarget(), { currentTime: 0, paused: true, seeking: false,
    parentElement: {}, buffered: { length: 1, start: () => 0, end: () => 20 } }) as HTMLVideoElement;
  const controller = new Controller(), feeder = new MPEGTSFeeder(), text = new TextRenderer();
  controller.attachRenderer(text); controller.attachFeeder(feeder); controller.attachMedia(media);
  feeder.prepare(0);
  return { media, controller, feeder, text, destroy() {
    controller.detachMedia(); controller.detachFeeder(); feeder.destroy(); text.destroy();
  } };
}

test.each([false, true])('reconstructs a page after a past cue arrives (clear=%s)', async (clears) => {
  const f = setup();
  try {
    f.media.currentTime = 2.5;
    f.feeder.feedB24(management(), 0);
    f.feeder.feedB24(statement([0x0c, 0x41]), 1);
    f.feeder.feedB24(statement([0x43]), 2);
    await vi.waitFor(() => expect(f.text.getText()).toBe('AC'));
    f.feeder.feedB24(statement(clears ? [0x0c] : [0x42]), 1.5);
    await vi.waitFor(() => expect(f.text.getText()).toBe(clears ? 'C' : 'ABC'));
    const replacement = new TextRenderer();
    f.controller.attachRenderer(replacement);
    expect(replacement.getText()).toBe(clears ? 'C' : 'ABC');
    f.controller.detachRenderer(replacement); replacement.destroy();
  } finally { f.destroy(); }
});

test('does not rewind current management when an old group arrives late', async () => {
  const f = setup();
  try {
    f.media.currentTime = 3;
    f.feeder.feedB24(management(0), 0);
    f.feeder.feedB24(management(1), 2);
    await vi.waitFor(() => expect(f.feeder.content(3)?.pts).toBe(2));
    f.feeder.feedB24(management(0), 1);
    f.media.currentTime = 3.5;
    f.feeder.feedB24(statement([0x0c, 0x41], 1), 3.1);
    f.feeder.content(3.5);
    await vi.waitFor(() => expect(f.text.getText()).toBe('A'));
    f.feeder.feedB24(management(0), 4);
    f.media.currentTime = 4.5;
    f.feeder.feedB24(statement([0x0c, 0x42], 0), 4.1);
    f.feeder.content(4.5);
    await vi.waitFor(() => expect(f.text.getText()).toBe('B'));
    f.media.seeking = true; f.media.dispatchEvent(new Event('seeking'));
    f.media.currentTime = 3.5; f.media.seeking = false; f.media.dispatchEvent(new Event('seeked'));
    await vi.waitFor(() => expect(f.text.getText()).toBe('A'));
  } finally { f.destroy(); }
});

test.each([false, true])('synchronizes a moved live boundary before seek reset (hidden replacement=%s)', async (replaced) => {
  const f = setup();
  let start = 0;
  Object.assign(f.media, { buffered: { length: 1, start: () => start, end: () => 20 } });
  try {
    f.media.currentTime = 10.5;
    f.feeder.feedB24(management(), 0);
    for (let time = 1; time <= 10; time++) {
      f.feeder.feedB24(statement(time === 1 ? [0x0c, 0x41] : [0x42]), time);
    }
    await vi.waitFor(() => expect(f.text.getText()).toBe('A' + 'B'.repeat(9)));
    start = 8; f.media.dispatchEvent(new Event('progress'));
    if (replaced) {
      f.controller.hide();
      f.feeder.feedB24(statement([0x0c, 0x44]), 1);
      await vi.waitFor(() => expect((f.controller as any).paintedCues[0].snapshot.data.some((token: any) =>
        token.tag === 'Character' && token.character === 'D')).toBe(true));
    }
    start = 9; // No progress/canplay event before the seek.
    f.media.seeking = true; f.media.dispatchEvent(new Event('seeking'));
    f.media.currentTime = 10.2; f.media.seeking = false; f.media.dispatchEvent(new Event('seeked'));
    f.controller.show();
    await vi.waitFor(() => expect(f.text.getText()).toBe((replaced ? 'D' : 'A') + 'B'.repeat(9)));
  } finally { f.destroy(); }
});

test('show restores the entire retained page after the old hidden anchor is pruned', async () => {
  const f = setup();
  let start = 0;
  Object.assign(f.media, { buffered: { length: 1, start: () => start, end: () => 20 } });
  try {
    f.media.currentTime = 1.5;
    f.feeder.feedB24(management(), 0); f.feeder.feedB24(statement([0x0c, 0x41]), 1);
    await vi.waitFor(() => expect(f.text.getText()).toBe('A'));
    f.controller.hide(); f.media.paused = false; f.media.currentTime = 10;
    f.feeder.feedB24(statement([0x0c, 0x42]), 4); f.feeder.feedB24(statement([0x43]), 5);
    await vi.waitFor(() => expect(f.feeder.content(10)?.pts).toBe(5));
    start = 8; f.media.dispatchEvent(new Event('progress'));
    expect(f.feeder.contentRange(1, 10)).toBeNull();
    f.controller.show(); expect(f.text.getText()).toBe('BC');
  } finally { f.destroy(); }
});
