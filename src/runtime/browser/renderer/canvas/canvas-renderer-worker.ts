import { ARIBB24ParserState } from "../../../../lib/parser/parser";
import CanvasRenderer from "./canvas-renderer";

import RenderingWorker from "./canvas-renderer-worker.worker?worker&inline";
import { FromMainToWorkerEventClear, FromMainToWorkerEventInitialize, FromMainToWorkerEventRender, FromMainToWorkerEventResize, FromWorkerToMainEvent, FromWorkerToMainEventImageBitmap } from "./canvas-renderer-worker.event";
import { CaptionAssociationInformation } from "../../../../lib/demuxer/b24/datagroup";
import { ARIBB24BrowserToken, replaceDRCS } from "../../types";
import { PartialCanvasRendererOption } from "./canvas-renderer-option";

export default class CanvasWebWorkerRenderer extends CanvasRenderer {
  private buffer: OffscreenCanvas;
  private present: OffscreenCanvas;
  private worker: Worker;
  private failed = false;
  private destroyed = false;
  private waitPromise: Promise<void> | null = null;
  private waitResolve: () => void = () => {};
  private bitmapResolve: ((bitmap: ImageBitmap | null) => void) | null = null;

  public constructor(option?: PartialCanvasRendererOption, private readonly onFailure?: (error: Error) => void) {
    super(option);
    this.present = this.canvas.transferControlToOffscreen();
    this.buffer = new OffscreenCanvas(0, 0);
    this.worker = new RenderingWorker();
    this.worker.addEventListener('message', this.onWorkerMessage);
    this.worker.addEventListener('error', this.onWorkerError);
    this.worker.addEventListener('messageerror', this.onWorkerMessageError);
    try {
      this.worker.postMessage(FromMainToWorkerEventInitialize.from(this.present, this.buffer), [this.present, this.buffer]);
    } catch (error) {
      this.destroy();
      throw error;
    }
  }

  private readonly onWorkerMessage = (event: MessageEvent<FromWorkerToMainEvent>): void => {
    switch (event.data.type) {
      case 'imagebitmap': {
        if (this.bitmapResolve == null) {
          event.data.bitmap?.close();
        } else {
          this.settleBitmap(event.data.bitmap);
        }
        break;
      }
      case 'error': {
        this.fail(new Error(event.data.message));
        break;
      }
      case 'render-error': {
        console.error('[aribb24.js] Caption rendering failed:', event.data.message);
        break;
      }
    }
  };

  private readonly onWorkerError = (event: ErrorEvent): void => {
    this.fail(event.error instanceof Error ? event.error : new Error(event.message || 'ARIB caption Worker failed.'));
  };

  private readonly onWorkerMessageError = (): void => {
    this.fail(new Error('ARIB caption Worker message could not be decoded.'));
  };

  private settleBitmap(bitmap: ImageBitmap | null): void {
    const resolve = this.bitmapResolve;
    this.bitmapResolve = null;
    resolve?.(bitmap);
    this.waitResolve();
  }

  private fail(error: Error): void {
    if (this.failed || this.destroyed) { return; }
    this.failed = true;
    this.worker.terminate();
    this.settleBitmap(null);
    // A postMessage failure can occur inside a Controller render or resize
    // pass. Let that pass finish before a consumer replaces this renderer.
    queueMicrotask(() => {
      if (this.destroyed) { return; }
      if (this.onFailure) {
        this.onFailure(error);
      } else {
        console.error('[aribb24.js] Caption Worker failed:', error);
      }
    });
  }

  public resize(width: number, height: number): void {
    if (this.failed || this.destroyed) { return; }
    try {
      this.worker.postMessage(FromMainToWorkerEventResize.from(width, height));
    } catch (error) {
      this.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }

  public destroy(): void {
    if (this.destroyed) { return; }
    this.destroyed = true;
    this.worker.terminate();
    this.settleBitmap(null);
  }

  public clear(): void {
    if (this.failed || this.destroyed) { return; }
    try {
      this.worker.postMessage(FromMainToWorkerEventClear.from());
    } catch (error) {
      this.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }

  public render(initialState: ARIBB24ParserState, tokens: ARIBB24BrowserToken[], info: CaptionAssociationInformation): void {
    const bitmaps = [...new Set(tokens.flatMap((token) => token.tag === 'Bitmap'
      ? [token.normal_bitmap, token.flashing_bitmap].filter((bitmap): bitmap is ImageBitmap => bitmap != null)
      : []))];
    if (this.failed || this.destroyed) {
      bitmaps.forEach((bitmap) => bitmap.close());
      return;
    }
    try {
      const data = replaceDRCS(tokens, this.option.replace.drcs);
      // The Controller gives every renderer its own ImageBitmap copies. Transfer
      // this renderer's copies rather than leaving them alive on the main thread.
      this.worker.postMessage(FromMainToWorkerEventRender.from(initialState, data, info, this.option), bitmaps);
    } catch (error) {
      bitmaps.forEach((bitmap) => bitmap.close());
      this.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }

  public async getPresentationImageBitmap(): Promise<ImageBitmap | null> {
    if (this.failed || this.destroyed) { return null; }
    while (this.waitPromise != null) {
      await this.waitPromise;
      if (this.failed || this.destroyed) { return null; }
    }

    // Waiter
    this.waitPromise = new Promise((resolve) => {
      this.waitResolve = () => {
        this.waitPromise = null;
        this.waitResolve = () => {};
        resolve();
      };
    });

    const promise: Promise<ImageBitmap | null> = new Promise((resolve) => {
      this.bitmapResolve = resolve;
    });
    try {
      this.worker.postMessage(FromWorkerToMainEventImageBitmap.from());
    } catch (error) {
      this.fail(error instanceof Error ? error : new Error(String(error)));
    }
    return promise;
  }
}
