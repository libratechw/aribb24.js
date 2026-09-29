import { expect, test } from 'vitest';

import Controller from '@/runtime/browser/controller/controller';
import type Feeder from '@/runtime/browser/feeder/feeder';
import type Renderer from '@/runtime/browser/renderer/renderer';
import aribInitialState from '@/lib/parser/state/ARIB';
import { ARIBB24CharacterToken } from '@/lib/tokenizer/token';

test('a replaced earlier bitmap is not replayed after a resize', async () => {
  const makeBitmap = () => createImageBitmap(document.createElement('canvas'));
  const makeCue = (pts: number, character: string, bitmap?: ImageBitmap) => ({
    pts, duration: 10, state: aribInitialState,
    data: bitmap == null ? [ARIBB24CharacterToken.from(character)] : [
      { tag: 'Bitmap', normal_bitmap: bitmap }, ARIBB24CharacterToken.from(character),
    ],
    info: { association: 'ARIB' as const, language: 'jpn' },
  });
  let first = makeCue(1, '旧', await makeBitmap());
  const second = makeCue(2, '後');
  let changed: ((pts?: readonly number[]) => void) | null = null;
  const feeder = {
    prepare() {}, content: (time: number) => time >= 2 ? second : first,
    clear() {}, destroy() {}, onAttach() {}, onDetach() {}, onSeeking() {},
    setPresentationChangeHandler: (handler: typeof changed) => { changed = handler; },
  } as unknown as Feeder;
  const drawn: string[] = [];
  const renderer = {
    render: (_state: unknown, data: typeof first.data) => {
      drawn.push(data.filter((token) => token.tag === 'Character')
        .map((token) => 'character' in token ? token.character : '').join(''));
      for (const token of data) {
        if (token.tag === 'Bitmap') { token.normal_bitmap.close(); }
      }
    },
    clear: () => { drawn.length = 0; },
    hide() {}, show() {}, destroy() {}, onAttach() {}, onDetach() {},
    onContainerResize: () => false, onVideoResize: () => false,
    onPlay() {}, onPause() {}, onSeeking() {},
  } as unknown as Renderer;
  const container = document.createElement('div');
  document.body.append(container);
  const media = Object.assign(new EventTarget(), {
    currentTime: 1, paused: true, seeking: false, parentElement: container,
    buffered: { length: 1, start: () => 0, end: () => 12 } as TimeRanges,
  }) as HTMLVideoElement;
  const controller = new Controller();
  try {
    controller.attachRenderer(renderer);
    controller.attachFeeder(feeder);
    controller.attachMedia(media);
    (controller as any).paint(true);
    media.currentTime = 2;
    (controller as any).paint(false);
    expect(drawn).toEqual(['旧', '後']);

    first.data[0].tag === 'Bitmap' && first.data[0].normal_bitmap.close();
    first = makeCue(1, '新', await makeBitmap());
    changed?.([1]);
    expect(drawn).toEqual(['新', '後']);
    (controller as any).paint(true); // container resize / replacement renderer
    expect(drawn).toEqual(['新', '後']);

    controller.detachMedia();
    if (first.data[0].tag === 'Bitmap') { first.data[0].normal_bitmap.close(); }
    first = makeCue(1, '再', await makeBitmap());
    controller.attachMedia(media);
    (controller as any).paint(true);
    expect(drawn).toEqual(['再', '後']);
  } finally {
    controller.detachMedia();
    controller.detachFeeder();
    if (first.data[0].tag === 'Bitmap') { first.data[0].normal_bitmap.close(); }
    container.remove();
  }
});
