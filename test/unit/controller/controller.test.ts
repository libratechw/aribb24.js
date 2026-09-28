import { afterEach, describe, expect, test, vi } from 'vitest';

import Controller from '@/runtime/browser/controller/controller';
import { EventType } from '@/runtime/browser/controller/events';
import type Feeder from '@/runtime/browser/feeder/feeder';
import type Renderer from '@/runtime/browser/renderer/renderer';
import { ARIBB24BuiltinSoundReplayToken } from '@/lib/tokenizer/token';

afterEach(() => vi.unstubAllGlobals());

describe('Controller visibility and rendering loop', () => {
  test('passes an unbuffered attach position to a feeder awaiting seek replay', () => {
    const feeder = {
      prepare: vi.fn(), content: vi.fn(() => null),
      clear: vi.fn(), destroy: vi.fn(), onAttach: vi.fn(), onDetach: vi.fn(),
      onSeeking: vi.fn(),
    } as unknown as Feeder;
    const media = Object.assign(new EventTarget(), {
      currentTime: 1000, parentElement: null,
      buffered: { length: 0 } as TimeRanges,
    }) as HTMLVideoElement;
    const controller = new Controller();
    controller.attachFeeder(feeder);
    controller.attachMedia(media);
    expect(feeder.prepare).toHaveBeenLastCalledWith(1000, null);
    controller.detachMedia();
    controller.detachFeeder();
  });

  test('does not render a hidden paused seek twice when shown again', () => {
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

    const mediaElement = Object.assign(new EventTarget(), {
      currentTime: 0, paused: true, seeking: false, parentElement: {} as HTMLElement,
      buffered: { length: 1, start: () => 0, end: () => 20 } as TimeRanges,
    });
    const render = vi.fn();
    const renderer = {
      render, clear: vi.fn(), hide: vi.fn(), show: vi.fn(), destroy: vi.fn(),
      onAttach: vi.fn(), onDetach: vi.fn(), onContainerResize: vi.fn(() => false),
      onVideoResize: vi.fn(() => false), onPlay: vi.fn(), onPause: vi.fn(), onSeeking: vi.fn(),
    } satisfies Renderer;
    const feeder = {
      prepare: vi.fn(), content: vi.fn(() => ({ pts: 5, duration: 10, state: {}, data: [], info: {} })),
      clear: vi.fn(), destroy: vi.fn(), onAttach: vi.fn(), onDetach: vi.fn(),
      onSeeking: vi.fn(), onSeeked: vi.fn(),
    } as unknown as Feeder;
    const controller = new Controller();
    controller.attachRenderer(renderer);
    controller.attachFeeder(feeder);
    controller.attachMedia(mediaElement as HTMLVideoElement);

    controller.hide();
    mediaElement.currentTime = 7;
    mediaElement.dispatchEvent(new Event('seeking'));
    mediaElement.dispatchEvent(new Event('seeked'));
    expect(render).not.toHaveBeenCalled();

    controller.show();
    expect(render).toHaveBeenCalledTimes(1);
    const [id, callback] = [...pending.entries()][0];
    pending.delete(id);
    callback(0);
    expect(render).toHaveBeenCalledTimes(1);
    controller.hide();
    controller.detachMedia();
  });

  test('repaints a paused seek without restarting the rendering loop', () => {
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

    const mediaElement = Object.assign(new EventTarget(), {
      currentTime: 0, paused: true, parentElement: {} as HTMLElement,
      buffered: { length: 1, start: () => 0, end: () => 20 } as TimeRanges,
    });
    const media = mediaElement as unknown as HTMLVideoElement;
    const render = vi.fn();
    const renderer = {
      render, clear: vi.fn(), hide: vi.fn(), show: vi.fn(), destroy: vi.fn(),
      onAttach: vi.fn(), onDetach: vi.fn(), onContainerResize: vi.fn(() => false),
      onVideoResize: vi.fn(() => false), onPlay: vi.fn(), onPause: vi.fn(), onSeeking: vi.fn(),
    } satisfies Renderer;
    let cueAvailable = true;
    let cue = {pts: 5, duration: 10, state: {}, data: [ARIBB24BuiltinSoundReplayToken.from(1)], info: {}};
    const sound = vi.fn();
    let presentationChangeHandler: (() => void) | null = null;
    const feeder = {
      prepare: vi.fn(), content: vi.fn((time: number) => time >= 5 && cueAvailable ? cue : null),
      clear: vi.fn(), destroy: vi.fn(), onAttach: vi.fn(), onDetach: vi.fn(),
      onSeeking: vi.fn(), onSeeked: vi.fn(),
      setPresentationChangeHandler: vi.fn((handler: (() => void) | null) => {
        presentationChangeHandler = handler;
      }),
    } as unknown as Feeder;
    const controller = new Controller();
    controller.on(EventType.BuiltinSound, sound);
    controller.attachRenderer(renderer);
    controller.attachFeeder(feeder);
    controller.attachMedia(media);

    mediaElement.paused = false;
    media.dispatchEvent(new Event('play'));
    expect(pending.size).toBe(1);
    mediaElement.paused = true;
    media.dispatchEvent(new Event('pause'));
    expect(pending.size).toBe(0);
    mediaElement.currentTime = 7;
    media.dispatchEvent(new Event('seeking'));
    media.dispatchEvent(new Event('seeked'));
    expect(feeder.onSeeked).toHaveBeenCalledOnce();
    expect(render).toHaveBeenCalledOnce();
    expect(pending.size).toBe(0);

    mediaElement.paused = false;
    media.dispatchEvent(new Event('play'));
    const [id, callback] = pending.entries().next().value!;
    pending.delete(id);
    callback(0);
    expect(render).toHaveBeenCalledOnce();
    expect(sound).toHaveBeenCalledOnce();
    mediaElement.paused = true;
    media.dispatchEvent(new Event('pause'));

    // A metadata cue may finish decoding after seeked, while rAF remains stopped.
    cueAvailable = false;
    mediaElement.currentTime = 12;
    media.dispatchEvent(new Event('seeking'));
    media.dispatchEvent(new Event('seeked'));
    expect(render).toHaveBeenCalledOnce();
    cueAvailable = true;
    presentationChangeHandler?.();
    expect(render).toHaveBeenCalledTimes(2);
    // Repeated feeder notifications for the same visible cue must not append
    // its semi-transparent glyphs and background a second time.
    presentationChangeHandler?.();
    expect(render).toHaveBeenCalledTimes(2);
    // Replacing the presentation at the same PTS is a real update, not a
    // duplicate notification.
    const clearsBeforeReplacement = renderer.clear.mock.calls.length;
    cue = {...cue, data: [ARIBB24BuiltinSoundReplayToken.from(2)]};
    presentationChangeHandler?.();
    expect(render).toHaveBeenCalledTimes(3);
    expect(renderer.clear).toHaveBeenCalledTimes(clearsBeforeReplacement + 1);
    controller.hide();
    presentationChangeHandler?.();
    controller.show();
    expect(render).toHaveBeenCalledTimes(3);
    controller.hide();
    expect(pending.size).toBe(0);
    controller.detachMedia();
  });

  test('gives every renderer its own cue tokens during a resize repaint', () => {
    const tokens = [{ tag: 'Bitmap', normal_bitmap: { closed: false } }];
    const observed: boolean[] = [];
    const renderer = (consume: boolean) => ({
      render: (_state: unknown, data: typeof tokens) => {
        observed.push(data[0].normal_bitmap.closed);
        if (consume) data[0].normal_bitmap.closed = true;
      },
      clear() {}, hide() {}, show() {}, destroy() {}, onAttach() {}, onDetach() {},
      onContainerResize: () => false, onVideoResize: () => false,
      onPlay() {}, onPause() {}, onSeeking() {},
    }) as unknown as Renderer;
    const feeder = {
      prepare() {}, content: () => ({ pts: 1, duration: 10, state: {}, data: tokens, info: {} }),
      clear() {}, destroy() {}, onAttach() {}, onDetach() {}, onSeeking() {},
    } as unknown as Feeder;
    const controller = new Controller();
    controller.attachRenderer(renderer(true));
    controller.attachRenderer(renderer(false));
    controller.attachFeeder(feeder);
    controller.attachMedia(Object.assign(new EventTarget(), {
      currentTime: 1, parentElement: null,
      buffered: { length: 1, start: () => 0, end: () => 20 } as TimeRanges,
    }) as HTMLVideoElement);
    (controller as any).paint(true);
    expect(observed).toEqual([false, false]);
    expect(tokens[0].normal_bitmap.closed).toBe(false);
    controller.detachMedia();
  });

  test('starts the loop when captions are shown after playback began while hidden', () => {
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

    const container = {} as HTMLElement;
    const media = Object.assign(new EventTarget(), {
      currentTime: 0,
      parentElement: container,
    }) as unknown as HTMLVideoElement;
    const controller = new Controller();
    controller.attachMedia(media);

    controller.hide();
    media.dispatchEvent(new Event('play'));
    expect(pending.size).toBe(0);

    controller.show();
    expect(pending.size).toBe(1);
    const [id, callback] = [...pending.entries()][0];
    pending.delete(id);
    callback(0);
    expect(pending.size).toBe(1);

    controller.hide();
    expect(pending.size).toBe(0);
    controller.detachMedia();
  });

  test('skips zero-size repaint and redraws the current cue after a hidden resize', () => {
    const pending = new Map<number, FrameRequestCallback>();
    let nextId = 1;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      const id = nextId++;
      pending.set(id, callback);
      return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => pending.delete(id));
    vi.stubGlobal('devicePixelRatio', 1);

    let onResize: ResizeObserverCallback | null = null;
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: ResizeObserverCallback) { onResize = callback; }
      observe() {}
      unobserve() {}
      disconnect() {}
    });

    const container = {} as HTMLElement;
    const mediaElement = Object.assign(new EventTarget(), {
      currentTime: 1,
      videoWidth: 1920,
      videoHeight: 1080,
      parentElement: container,
      buffered: { length: 1, start: () => 0, end: () => 20 } as TimeRanges,
    });
    const media = mediaElement as unknown as HTMLVideoElement;
    const render = vi.fn();
    const onContainerResize = vi.fn(() => true);
    const onVideoResize = vi.fn(() => true);
    const renderer = {
      render,
      clear: vi.fn(), hide: vi.fn(), show: vi.fn(), destroy: vi.fn(),
      onAttach: vi.fn(), onDetach: vi.fn(), onContainerResize, onVideoResize,
      onPlay: vi.fn(), onPause: vi.fn(), onSeeking: vi.fn(),
    } satisfies Renderer;
    const textRender = vi.fn();
    const textRenderer = {
      ...renderer,
      render: textRender,
      onContainerResize: vi.fn(() => false),
      onVideoResize: vi.fn(() => false),
    } satisfies Renderer;
    let cuePts = 1;
    const feeder = {
      prepare: vi.fn(), content: vi.fn(() => ({pts: cuePts, duration: 10, state: {}, data: [ARIBB24BuiltinSoundReplayToken.from(1)], info: {}})),
      clear: vi.fn(), destroy: vi.fn(), onAttach: vi.fn(), onDetach: vi.fn(), onSeeking: vi.fn(),
    } as unknown as Feeder;

    const controller = new Controller();
    const sound = vi.fn();
    controller.on(EventType.BuiltinSound, sound);
    controller.attachRenderer(renderer);
    controller.attachRenderer(textRenderer);
    controller.attachFeeder(feeder);
    controller.attachMedia(media);
    media.dispatchEvent(new Event('play'));
    const tick = () => {
      const [id, callback] = [...pending.entries()][0];
      pending.delete(id);
      callback(0);
    };
    tick();
    expect(render).toHaveBeenCalledTimes(1);
    expect(textRender).toHaveBeenCalledTimes(1);
    expect(sound).toHaveBeenCalledTimes(1);

    controller.hide();
    const resize = (width: number, height: number) => {
      const entry = {target: container, contentBoxSize: [{inlineSize: width, blockSize: height}]} as unknown as ResizeObserverEntry;
      onResize!([entry], {} as ResizeObserver);
    };
    resize(0, 0);
    expect(onContainerResize).not.toHaveBeenCalled();
    resize(640, 360);
    expect(onContainerResize).toHaveBeenCalledOnce();
    expect(render).toHaveBeenCalledTimes(1);
    expect(textRender).toHaveBeenCalledTimes(1);

    mediaElement.videoWidth = 0;
    media.dispatchEvent(new Event('resize'));
    expect(onVideoResize).not.toHaveBeenCalled();
    mediaElement.videoWidth = 1920;
    media.dispatchEvent(new Event('resize'));
    expect(onVideoResize).toHaveBeenCalledOnce();
    expect(render).toHaveBeenCalledTimes(1);
    expect(textRender).toHaveBeenCalledTimes(1);

    controller.show();
    tick();
    expect(render).toHaveBeenCalledTimes(2);
    expect(textRender).toHaveBeenCalledTimes(1);
    expect(sound).toHaveBeenCalledTimes(1);

    // A cue change while hidden requires both renderers to receive the new
    // cue, even if only one renderer reported a resize.
    controller.hide();
    cuePts = 2;
    mediaElement.currentTime = 2;
    resize(800, 450);
    controller.show();
    tick();
    expect(render).toHaveBeenCalledTimes(3);
    expect(textRender).toHaveBeenCalledTimes(2);
    controller.detachMedia();
  });
});
