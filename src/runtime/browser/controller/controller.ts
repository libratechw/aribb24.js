import ARIBB24Feeder from "../feeder/feeder";
import ARIBB24Renderer from "../renderer/renderer";
import { ControllerOption } from "./controller-option";
import EventEmitter from "./eventemitter";
import { Event, EventType, BuiltinSound } from "./events";

export default class Controller {
  // Option
  private option: ControllerOption;
  // Video
  private media: HTMLVideoElement | null = null;
  private container: HTMLElement | null = null;
  // Container Resize Handler
  private readonly onContainerResizeHandler = this.onContainerResize.bind(this);
  private resize_observer: ResizeObserver | null = null;
  // Video Resize Handler
  private readonly onVideoResizeHandler = this.onVideoResize.bind(this);
  // Timeupdate Handler
  private readonly onTimeupdateHandler = this.onTimeupdate.bind(this);
  private timer: number | null = null;
  // Seeking Handler
  private readonly onSeekingHandler = this.onSeeking.bind(this);
  private readonly onSeekedHandler = this.onSeeked.bind(this);
  private readonly onPresentationChangedHandler = this.onPresentationChanged.bind(this);
  // Play/Pause Handler
  private readonly onPlayHandler = this.onPlay.bind(this);
  private readonly onPauseHandler = this.onPause.bind(this);
  // Renderer
  private renderers: ARIBB24Renderer[] = [];
  private privious_pts: number | null = null;
  private lastPaintedCue: ReturnType<ARIBB24Feeder['content']> = null;
  private pendingSoundCuePts: number | null = null;
  private needsRepaint: Set<ARIBB24Renderer> = new Set();
  // Feeder
  private feeder: ARIBB24Feeder | null = null;
  // Control
  private isShowing: boolean = true;
  // Event Bus
  private emitter: EventEmitter = new EventEmitter();

  public constructor(option?: Partial<ControllerOption>) {
    this.option = {
      ... option,
    }
  }

  public attachMedia(media: HTMLVideoElement, container?: HTMLElement): void {
    if (this.container) {
      this.renderers.forEach((renderer) => renderer.onDetach());
    }
    this.media = media;
    this.container = container ?? media.parentElement!;
    if (this.container) {
      this.renderers.forEach((renderer) => renderer.onAttach(this.container!));
    }
    this.feeder?.prepare(this.media.currentTime, this.bufferedStart(this.media.currentTime));
    this.setupHandlers();
  }

  public detachMedia(): void {
    if (this.container) {
      this.renderers.forEach((renderer) => renderer.onDetach());
    }
    this.cleanupHandlers()
    this.media = this.container = null
  }

  private setupHandlers() {
    if (!this.media || !this.container) { return; }

    // setup media handler
    this.media.addEventListener('seeking', this.onSeekingHandler);
    this.media.addEventListener('seeked', this.onSeekedHandler);
    this.media.addEventListener('resize', this.onVideoResizeHandler);
    this.media.addEventListener('play', this.onPlayHandler);
    this.media.addEventListener('pause', this.onPauseHandler);

    // setup container Resize Handler
    this.resize_observer = new ResizeObserver(this.onContainerResizeHandler);
    this.resize_observer.observe(this.container);
  }

  private cleanupHandlers() {
    // cleanup media seeking handler
    this.media?.removeEventListener('seeking', this.onSeekingHandler);
    this.media?.removeEventListener('seeked', this.onSeekedHandler);
    this.media?.removeEventListener('resize', this.onVideoResizeHandler);
    this.media?.removeEventListener('play', this.onPlayHandler);
    this.media?.removeEventListener('pause', this.onPauseHandler);

    // setup container Resize Handler
    if (this.container) {
      this.resize_observer?.unobserve(this.container);
    }
    this.resize_observer?.disconnect();
    this.resize_observer = null;
  }

  public attachFeeder(feeder: ARIBB24Feeder) {
    this.detachFeeder();
    this.feeder = feeder;
    this.feeder.setPresentationChangeHandler?.(this.onPresentationChangedHandler);
    this.feeder.onAttach();

    if (this.media != null) {
      this.feeder.prepare(this.media.currentTime, this.bufferedStart(this.media.currentTime));
    }
  }

  public detachFeeder() {
    this.feeder?.setPresentationChangeHandler?.(null);
    this.feeder?.onDetach();
    this.feeder = null;
  }

  public attachRenderer(renderer: ARIBB24Renderer) {
    renderer.onDetach();
    this.renderers.push(renderer);
    if (this.container) {
      renderer.onAttach(this.container);
    }
  }

  public detachRenderer(renderer: ARIBB24Renderer) {
    renderer.onDetach();
    this.needsRepaint.delete(renderer);
    this.renderers = this.renderers.filter((elem) => elem !== renderer);
  }

  public on<T extends keyof Event>(type: T, handler: ((payload: Event[T]) => void)): void {
    this.emitter.on(type, handler);
  }
  public off<T extends keyof Event>(type: T, handler: ((payload: Event[T]) => void)): void {
    this.emitter.off(type, handler);
  }

  private onSeeking() {
    this.feeder?.onSeeking();
    this.renderers.forEach((renderer) => renderer.onSeeking());
    this.clear();
  }

  private bufferedStart(time: number): number | null {
    if (this.media == null) { return null; }
    const ranges = this.media.buffered;
    for (let index = 0; index < ranges.length; index++) {
      if (ranges.start(index) <= time && time <= ranges.end(index)) {
        return ranges.start(index);
      }
    }
    return null;
  }

  private onSeeked() {
    if (!this.media?.paused) { return; }
    this.feeder?.onSeeked?.();
    if (this.isShowing) {
      this.paint(true);
    } else {
      this.renderers.forEach((renderer) => this.needsRepaint.add(renderer));
    }
  }

  private onPresentationChanged() {
    if (!this.media?.paused || this.media.seeking) { return; }
    const currentTime = this.media.currentTime;
    const current = this.feeder?.content(currentTime, this.bufferedStart(currentTime)) ?? null;
    // The decoder may notify us about an older cue or repeat a feeder scan.
    // Repainting the same presentation appends its glyphs a second time.
    if (current != null && currentTime < current.pts + current.duration &&
        current === this.lastPaintedCue && this.privious_pts === current.pts) { return; }
    if (this.isShowing) {
      this.paint(true);
    } else {
      this.renderers.forEach((renderer) => this.needsRepaint.add(renderer));
    }
  }

  private onContainerResize(entries: ResizeObserverEntry[]) {
    if (!this.media || !this.container) { return; }

    const target = entries.find((entry) => entry.target === this.container);
    if (!target) { return; }

    const width = target.devicePixelContentBoxSize != null ? target.devicePixelContentBoxSize[0].inlineSize : Math.floor(target.contentBoxSize[0].inlineSize * devicePixelRatio);
    const height = target.devicePixelContentBoxSize != null ? target.devicePixelContentBoxSize[0].blockSize : Math.floor(target.contentBoxSize[0].blockSize * devicePixelRatio);
    if (width <= 0 || height <= 0) { return; }

    const resized: ARIBB24Renderer[] = [];
    this.renderers.forEach((renderer) => {
      if (renderer.onContainerResize(width, height)) { resized.push(renderer); }
    });
    if (resized.length === 0) { return; }
    if (this.isShowing) {
      this.paint(true, resized);
    } else {
      resized.forEach((renderer) => this.needsRepaint.add(renderer));
    }
  }

  private onVideoResize() {
    if (!this.media || !this.container) { return; }
    if (this.media.videoWidth <= 0 || this.media.videoHeight <= 0) { return; }

    const resized: ARIBB24Renderer[] = [];
    this.renderers.forEach((renderer) => {
      if (renderer.onVideoResize(this.media!.videoWidth, this.media!.videoHeight)) { resized.push(renderer); }
    });
    if (resized.length === 0) { return; }
    if (this.isShowing) {
      this.paint(true, resized);
    } else {
      resized.forEach((renderer) => this.needsRepaint.add(renderer));
    }
  }

  private onTimeupdate() {
    this.timer = null;
    // not showing, do not show
    if (!this.isShowing) { return; }

    this.registerRenderingLoop();
    this.paint(false);
  }

  private registerRenderingLoop(): void {
    this.timer = requestAnimationFrame(this.onTimeupdateHandler);
  }

  private unregisterRenderingLoop(): void {
    if (this.timer == null) { return; }
    cancelAnimationFrame(this.timer);
    this.timer = null;
  }

  private onPlay(): void {
    if (this.media != null) {
      this.feeder?.prepare(this.media.currentTime, this.bufferedStart(this.media.currentTime));
    }

    this.renderers.forEach((renderer) => {
      renderer.onPlay();
    });

    if (!this.isShowing || this.timer != null) { return }
    this.registerRenderingLoop();
  }

  private onPause(): void {
    this.renderers.forEach((renderer) => {
      renderer.onPause();
    });

    this.unregisterRenderingLoop();
  }

  private paint(repaint: boolean, renderers: ARIBB24Renderer[] = this.renderers) {
    // precondition
    if (!this.media) { return; }
    if (this.media.seeking) { return; }

    const currentTime = this.media.currentTime;
    const current = this.feeder?.content(currentTime, this.bufferedStart(currentTime)) ?? null;
    if (repaint) {
      // paint
      if (current == null || currentTime >= current.pts + current.duration) {
        renderers.forEach((renderer) => renderer.clear());
      } else {
        // A renderer may consume and close bitmap tokens. Each renderer must
        // own its copy, including during a resize repaint.
        renderers.forEach((renderer) => renderer.render(structuredClone(current.state), structuredClone(current.data), structuredClone(current.info)));
      }

      if (renderers === this.renderers) {
        // A complete paused repaint has already drawn this cue. Do not append
        // it again on the first play frame; defer its sound until play instead.
        const shown = current != null && currentTime < current.pts + current.duration;
        if (shown && this.privious_pts !== current.pts) {
          this.pendingSoundCuePts = current.pts;
        } else if (!shown) {
          this.pendingSoundCuePts = null;
        }
        this.privious_pts = shown ? current.pts
          : current != null ? current.pts + current.duration : null;
        this.lastPaintedCue = shown ? current : null;
      }

      return;
    }

    // render
    if (current == null) { // current is null
      if (this.privious_pts == null) { return; }
      this.renderers.forEach((renderer) => renderer.clear());
      this.privious_pts = null;
      this.lastPaintedCue = null;
      this.pendingSoundCuePts = null;
    } else if (currentTime >= current.pts + current.duration) { // cue duration expired, clear
      const end = current.pts + current.duration;
      if (this.privious_pts === end) { return; }
      this.renderers.forEach((renderer) => renderer.clear());
      this.privious_pts = end; // end is finite
      this.lastPaintedCue = null;
      this.pendingSoundCuePts = null;
    } else { // render
      if (this.privious_pts === current.pts) {
        if (!this.media.paused && this.pendingSoundCuePts === current.pts) {
          this.emitBuiltinSounds(current);
          this.pendingSoundCuePts = null;
        }
        return;
      }
      this.renderers.forEach((renderer) => renderer.render(structuredClone(current.state), structuredClone(current.data), structuredClone(current.info)));
      this.privious_pts = current.pts
      this.lastPaintedCue = current;
      this.pendingSoundCuePts = null;
      this.emitBuiltinSounds(current);
    }
  }

  private emitBuiltinSounds(current: NonNullable<ReturnType<ARIBB24Feeder['content']>>): void {
    for (const token of current.data.filter((data) => data.tag === 'BuiltinSoundReplay')) {
      this.emitter.emit(EventType.BuiltinSound, BuiltinSound.from(token.sound));
    }
  }

  private clear() {
    // clearRect for viewer
    this.renderers.forEach((renderer) => renderer.clear());
    // clear privious information
    this.privious_pts = null;
    this.lastPaintedCue = null;
    this.pendingSoundCuePts = null;
  }

  public show(): void {
    this.isShowing = true;
    this.renderers.forEach((renderer) => renderer.show());
    if (this.needsRepaint.size > 0) {
      // A seek invalidates every renderer. A cue can also change while hidden
      // without a feeder notification, so a resize-only subset is insufficient
      // when the current presentation differs from the last painted one.
      const time = this.media?.currentTime;
      const current = time != null && !this.media?.seeking
        ? this.feeder?.content(time, this.bufferedStart(time)) ?? null : null;
      const marker = current == null || time == null ? null
        : time < current.pts + current.duration ? current.pts : current.pts + current.duration;
      if (this.needsRepaint.size === this.renderers.length || marker !== this.privious_pts) {
        this.paint(true);
      } else {
        this.paint(true, [...this.needsRepaint]);
      }
      this.needsRepaint.clear();
    }
    if (this.timer == null) {
      this.registerRenderingLoop();
    }
  }

  public hide(): void {
    this.isShowing = false;
    this.unregisterRenderingLoop();
    this.renderers.forEach((renderer) => renderer.hide());
  }

  public showing(): boolean {
    return this.isShowing;
  }
}
