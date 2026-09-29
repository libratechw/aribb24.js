import { afterEach, describe, expect, test, vi } from 'vitest';

import Controller from '@/runtime/browser/controller/controller';
import { EventType } from '@/runtime/browser/controller/events';
import type Feeder from '@/runtime/browser/feeder/feeder';
import type Renderer from '@/runtime/browser/renderer/renderer';
import { ARIBB24BuiltinSoundReplayToken, ARIBB24CharacterToken, ARIBB24ClearScreenToken } from '@/lib/tokenizer/token';
import aribInitialState from '@/lib/parser/state/ARIB';
import TextRenderer from '@/runtime/browser/renderer/text/text-renderer';

afterEach(() => vi.unstubAllGlobals());

describe('Controller visibility and rendering loop', () => {
  test('sizes and repaints a replacement renderer attached while captions are visible', () => {
    let resize!: ResizeObserverCallback;
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => {});
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: ResizeObserverCallback) { resize = callback; }
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    const container = {} as HTMLElement;
    const media = Object.assign(new EventTarget(), {
      currentTime: 1, paused: true, seeking: false, parentElement: container,
      videoWidth: 1920, videoHeight: 1080,
      buffered: { length: 1, start: () => 0, end: () => 2 } as TimeRanges,
    }) as HTMLVideoElement;
    const cue = { pts: 1, duration: 1, state: aribInitialState,
      data: [ARIBB24CharacterToken.from('あ')], info: { association: 'ARIB' as const, language: 'jpn' } };
    const feeder = {
      prepare() {}, content: () => cue, clear() {}, destroy() {}, onAttach() {}, onDetach() {},
      onSeeking() {}, onSeeked() {},
    } as unknown as Feeder;
    const makeRenderer = () => ({
      render: vi.fn(), clear: vi.fn(), hide: vi.fn(), show: vi.fn(), destroy: vi.fn(),
      onAttach: vi.fn(), onDetach: vi.fn(), onContainerResize: vi.fn(() => true),
      onVideoResize: vi.fn(() => false), onPlay: vi.fn(), onPause: vi.fn(), onSeeking: vi.fn(),
    } satisfies Renderer);
    const original = makeRenderer();
    const replacement = makeRenderer();
    const controller = new Controller();
    controller.attachRenderer(original);
    controller.attachFeeder(feeder);
    controller.attachMedia(media);
    resize([{ target: container, devicePixelContentBoxSize: [{ inlineSize: 100, blockSize: 50 }] } as unknown as ResizeObserverEntry], {} as ResizeObserver);
    controller.detachRenderer(original);
    controller.attachRenderer(replacement);
    expect(replacement.onContainerResize).toHaveBeenCalledWith(100, 50);
    expect(replacement.onVideoResize).toHaveBeenCalledWith(1920, 1080);
    expect(replacement.render).toHaveBeenCalledTimes(1);
    controller.detachMedia();
    controller.detachFeeder();
  });

  test('repaints a replacement renderer attached while captions are hidden after resize', () => {
    let resize!: ResizeObserverCallback;
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => {});
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: ResizeObserverCallback) { resize = callback; }
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    const container = {} as HTMLElement;
    const media = Object.assign(new EventTarget(), {
      currentTime: 1, paused: true, seeking: false, parentElement: container,
      buffered: { length: 1, start: () => 0, end: () => 2 } as TimeRanges,
    }) as HTMLVideoElement;
    const cue = { pts: 1, duration: 1, state: aribInitialState,
      data: [ARIBB24CharacterToken.from('あ')], info: { association: 'ARIB' as const, language: 'jpn' } };
    const feeder = {
      prepare() {}, content: () => cue, clear() {}, destroy() {}, onAttach() {}, onDetach() {},
      onSeeking() {}, onSeeked() {},
    } as unknown as Feeder;
    const makeRenderer = () => ({
      render: vi.fn(), clear: vi.fn(), hide: vi.fn(), show: vi.fn(), destroy: vi.fn(),
      onAttach: vi.fn(), onDetach: vi.fn(), onContainerResize: vi.fn(() => true),
      onVideoResize: vi.fn(() => false), onPlay: vi.fn(), onPause: vi.fn(), onSeeking: vi.fn(),
    } satisfies Renderer);
    const observer = makeRenderer();
    const oldWorker = makeRenderer();
    const replacement = makeRenderer();
    const controller = new Controller();
    controller.attachRenderer(observer);
    controller.attachRenderer(oldWorker);
    controller.attachFeeder(feeder);
    controller.attachMedia(media);
    media.dispatchEvent(new Event('seeked'));
    controller.hide();
    resize([{target: container, devicePixelContentBoxSize: [{inlineSize: 100, blockSize: 50}]} as unknown as ResizeObserverEntry], {} as ResizeObserver);
    controller.detachRenderer(oldWorker);
    controller.attachRenderer(replacement);
    controller.show();
    expect(replacement.render).toHaveBeenCalledTimes(1);
    controller.hide();
    controller.detachMedia();
    controller.detachFeeder();
  });

  test.each([false, true])('does not replay sound after a same-time update (hidden=%s)', (hidden) => {
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
    const media = Object.assign(new EventTarget(), {
      currentTime: 1, paused: true, seeking: false, parentElement: {} as HTMLElement,
      buffered: { length: 1, start: () => 0, end: () => 2 } as TimeRanges,
    }) as HTMLVideoElement;
    let cue = { pts: 1, duration: 1, state: aribInitialState,
      data: [ARIBB24BuiltinSoundReplayToken.from(1)], info: { association: 'ARIB' as const, language: 'jpn' } };
    let changed: (() => void) | null = null;
    const feeder = {
      prepare() {}, content: () => cue, clear() {}, destroy() {}, onAttach() {}, onDetach() {},
      onSeeking() {}, onSeeked() {},
      setPresentationChangeHandler: (handler: (() => void) | null) => { changed = handler; },
    } as unknown as Feeder;
    const renderer = new TextRenderer();
    const sound = vi.fn();
    const controller = new Controller();
    controller.on(EventType.BuiltinSound, sound);
    controller.attachRenderer(renderer);
    controller.attachFeeder(feeder);
    controller.attachMedia(media);
    media.dispatchEvent(new Event('seeking'));
    media.dispatchEvent(new Event('seeked'));
    if (hidden) controller.hide();
    media.paused = false;
    media.dispatchEvent(new Event('play'));
    cue = { ...cue, data: [ARIBB24BuiltinSoundReplayToken.from(2)] };
    changed?.();
    expect(sound).toHaveBeenCalledTimes(hidden ? 0 : 1);
    if (hidden) controller.show();
    const [id, callback] = pending.entries().next().value!;
    pending.delete(id);
    callback(0);
    expect(sound).toHaveBeenCalledTimes(hidden ? 0 : 1);
    controller.hide();
    controller.detachMedia();
    controller.detachFeeder();
  });

  test('repaints a statement decoded after a same-time cue during playback', () => {
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
    const media = Object.assign(new EventTarget(), {
      currentTime: 1, paused: false, seeking: false, parentElement: {} as HTMLElement,
      buffered: { length: 1, start: () => 0, end: () => 2 } as TimeRanges,
    }) as HTMLVideoElement;
    let cue = { pts: 1, duration: 1, state: aribInitialState,
      data: [ARIBB24CharacterToken.from('あ')], info: { association: 'ARIB' as const, language: 'jpn' } };
    let changed: (() => void) | null = null;
    const feeder = {
      prepare() {}, content: () => cue, clear() {}, destroy() {}, onAttach() {}, onDetach() {},
      onSeeking() {}, setPresentationChangeHandler: (handler: (() => void) | null) => { changed = handler; },
    } as unknown as Feeder;
    const renderer = new TextRenderer();
    const controller = new Controller();
    controller.attachRenderer(renderer);
    controller.attachFeeder(feeder);
    controller.attachMedia(media);
    media.dispatchEvent(new Event('play'));
    const [id, callback] = pending.entries().next().value!;
    pending.delete(id);
    callback(0);
    expect(renderer.getText()).toBe('あ');
    cue = { ...cue, data: [ARIBB24CharacterToken.from('い')] };
    changed?.();
    expect(renderer.getText()).toBe('い');
    changed?.();
    expect(renderer.getText()).toBe('い');
    controller.hide();
    controller.detachMedia();
    controller.detachFeeder();
  });

  test('replaces same-time text instead of appending to the retained image', () => {
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    const media = Object.assign(new EventTarget(), {
      currentTime: 1, paused: true, seeking: false, parentElement: {} as HTMLElement,
      buffered: { length: 1, start: () => 0, end: () => 2 } as TimeRanges,
    }) as HTMLVideoElement;
    let cue = { pts: 1, duration: 1, state: aribInitialState,
      data: [ARIBB24CharacterToken.from('あ')], info: { association: 'ARIB' as const, language: 'jpn' } };
    let changed: (() => void) | null = null;
    const feeder = {
      prepare() {}, content: () => cue, clear() {}, destroy() {}, onAttach() {}, onDetach() {},
      onSeeking() {}, onSeeked() {},
      setPresentationChangeHandler: (handler: (() => void) | null) => { changed = handler; },
    } as unknown as Feeder;
    const renderer = new TextRenderer();
    const controller = new Controller();
    controller.attachRenderer(renderer);
    controller.attachFeeder(feeder);
    controller.attachMedia(media);
    media.dispatchEvent(new Event('seeked'));
    expect(renderer.getText()).toBe('あ');
    cue = { ...cue, data: [ARIBB24CharacterToken.from('い')] };
    changed?.();
    expect(renderer.getText()).toBe('い');
    controller.detachMedia();
    controller.detachFeeder();
    feeder.destroy();
  });

  test('appends a late new line while paused without erasing the earlier line', () => {
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    const media = Object.assign(new EventTarget(), {
      currentTime: 1, paused: true, seeking: false, parentElement: {} as HTMLElement,
      buffered: { length: 1, start: () => 0, end: () => 3 } as TimeRanges,
    }) as HTMLVideoElement;
    let cue = { pts: 1, duration: 2, state: aribInitialState,
      data: [ARIBB24CharacterToken.from('あ')], info: { association: 'ARIB' as const, language: 'jpn' } };
    let changed: (() => void) | null = null;
    const feeder = {
      prepare() {}, content: () => cue, clear() {}, destroy() {}, onAttach() {}, onDetach() {},
      onSeeking() {}, onSeeked() {},
      setPresentationChangeHandler: (handler: (() => void) | null) => { changed = handler; },
    } as unknown as Feeder;
    const renderer = new TextRenderer();
    const controller = new Controller();
    controller.attachRenderer(renderer);
    controller.attachFeeder(feeder);
    controller.attachMedia(media);
    media.dispatchEvent(new Event('seeked'));
    expect(renderer.getText()).toBe('あ');
    media.currentTime = 2;
    cue = { ...cue, pts: 2, data: [ARIBB24CharacterToken.from('い')] };
    changed?.();
    expect(renderer.getText()).toBe('あい');
    controller.detachMedia();
    controller.detachFeeder();
    feeder.destroy();
  });

  test('retains built-up lines when the caption container changes size', () => {
    let resize!: ResizeObserverCallback;
    vi.stubGlobal('devicePixelRatio', 1);
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: ResizeObserverCallback) { resize = callback; }
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    const container = {} as HTMLElement;
    const media = Object.assign(new EventTarget(), {
      currentTime: 1, paused: true, seeking: false, parentElement: container,
      buffered: { length: 1, start: () => 0, end: () => 3 } as TimeRanges,
    }) as HTMLVideoElement;
    let cue: NonNullable<ReturnType<Feeder['content']>> = { pts: 1, duration: 2, state: aribInitialState,
      data: [ARIBB24CharacterToken.from('あ')], info: { association: 'ARIB' as const, language: 'jpn' } };
    const firstCue = cue;
    let changed: (() => void) | null = null;
    const feeder = {
      prepare() {}, content: (time: number) => time < 2 ? firstCue : cue,
      clear() {}, destroy() {}, onAttach() {}, onDetach() {},
      onSeeking() {}, onSeeked() {},
      setPresentationChangeHandler: (handler: (() => void) | null) => { changed = handler; },
    } as unknown as Feeder;
    const text = new TextRenderer();
    const renderer = {
      render: text.render.bind(text), clear: text.clear.bind(text),
      hide() {}, show() {}, destroy() {}, onAttach() {}, onDetach() {},
      onContainerResize: () => { text.clear(); return true; },
      onVideoResize: () => false, onPlay() {}, onPause() {}, onSeeking() {},
    } satisfies Renderer;
    const controller = new Controller();
    controller.attachRenderer(renderer);
    controller.attachFeeder(feeder);
    controller.attachMedia(media);
    media.dispatchEvent(new Event('seeked'));
    media.currentTime = 2;
    cue = { ...cue, pts: 2, data: [ARIBB24CharacterToken.from('い')] };
    changed?.();
    expect(text.getText()).toBe('あい');

    resize([{ target: container, devicePixelContentBoxSize: [{ inlineSize: 640, blockSize: 360 }] } as unknown as ResizeObserverEntry], {} as ResizeObserver);
    expect(text.getText()).toBe('あい');
    controller.detachMedia();
    controller.attachMedia(media);
    resize([{ target: container, devicePixelContentBoxSize: [{ inlineSize: 640, blockSize: 360 }] } as unknown as ResizeObserverEntry], {} as ResizeObserver);
    expect(text.getText()).toBe('あい');

    cue = { ...cue, data: [ARIBB24CharacterToken.from('う')] };
    changed?.();
    expect(text.getText()).toBe('あう');
    resize([{ target: container, devicePixelContentBoxSize: [{ inlineSize: 800, blockSize: 450 }] } as unknown as ResizeObserverEntry], {} as ResizeObserver);
    expect(text.getText()).toBe('あう');

    media.currentTime = 2.5;
    cue = { ...cue, pts: 2.5, data: [ARIBB24ClearScreenToken.from(), ARIBB24CharacterToken.from('え')] };
    changed?.();
    expect(text.getText()).toBe('え');
    resize([{ target: container, devicePixelContentBoxSize: [{ inlineSize: 960, blockSize: 540 }] } as unknown as ResizeObserverEntry], {} as ResizeObserver);
    expect(text.getText()).toBe('え');
    controller.detachMedia();
    controller.detachFeeder();
  });

  test('retains built-up lines when a cue arrives during a hidden pause', () => {
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => {});
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    const media = Object.assign(new EventTarget(), {
      currentTime: 1, paused: true, seeking: false, parentElement: {} as HTMLElement,
      buffered: { length: 1, start: () => 0, end: () => 3 } as TimeRanges,
    }) as HTMLVideoElement;
    let cue = { pts: 1, duration: 2, state: aribInitialState,
      data: [ARIBB24CharacterToken.from('あ')], info: { association: 'ARIB' as const, language: 'jpn' } };
    let changed: (() => void) | null = null;
    const feeder = {
      prepare() {}, content: () => cue, clear() {}, destroy() {}, onAttach() {}, onDetach() {},
      onSeeking() {}, onSeeked() {},
      setPresentationChangeHandler: (handler: (() => void) | null) => { changed = handler; },
    } as unknown as Feeder;
    const renderer = new TextRenderer();
    const controller = new Controller();
    controller.attachRenderer(renderer);
    controller.attachFeeder(feeder);
    controller.attachMedia(media);
    media.dispatchEvent(new Event('seeked'));
    controller.hide();
    media.currentTime = 2;
    cue = { ...cue, pts: 2, data: [ARIBB24CharacterToken.from('い')] };
    changed?.();
    controller.show();
    expect(renderer.getText()).toBe('あい');
    controller.hide();
    controller.detachMedia();
    controller.detachFeeder();
    feeder.destroy();
  });

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
    const clone = structuredClone;
    vi.stubGlobal('structuredClone', (value: unknown) => {
      const copy = clone(value);
      const tokensToClose = Array.isArray(copy) ? copy : (copy as { data?: unknown[] })?.data;
      if (Array.isArray(tokensToClose)) {
        for (const token of tokensToClose) {
          if (token.tag === 'Bitmap') {
            Object.defineProperty(token.normal_bitmap, 'close', {
              value: () => { token.normal_bitmap.closed = true; },
            });
          }
        }
      }
      return copy;
    });
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
