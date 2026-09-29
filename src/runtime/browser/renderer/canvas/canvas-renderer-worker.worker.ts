import { ExhaustivenessError } from "../../../../util/error";
import render from "./canvas-renderer-strategy";
import { FromMainToWorkerEvent, FromWorkerToMainEventError, FromWorkerToMainEventImageBitmap, FromWorkerToMainEventRenderError } from "./canvas-renderer-worker.event";

let present: OffscreenCanvas | null = null;
let buffer: OffscreenCanvas | null = null;
const workerScope = self as unknown as { postMessage(message: unknown, transfer?: Transferable[]): void };

self.addEventListener('message', (event: MessageEvent<FromMainToWorkerEvent>) => {
  try {
    switch (event.data.type) {
    case 'initialize': {
      present = event.data.present;
      buffer = event.data.buffer;
      break;
    }
    case 'resize': {
      const { width, height } = event.data;
      if (present == null) { break; }
      present.width = width;
      present.height = height;
      break;
    }
    case 'terminate': {
      if (present != null) {
        present.width = present.height = 0;
        present = null;
      }
      if (buffer != null) {
        buffer.width = buffer.height = 0;
        buffer = null;
      }
      break;
    }
    case 'clear': {
      if (present) {
        const context = present.getContext('2d');
        if (context) {
          context.clearRect(0, 0, present.width, present.height);
        }
      }
      if (buffer) {
        const context = buffer.getContext('2d');
        if (context) {
          context.clearRect(0, 0, buffer.width, buffer.height);
        }
      }
      break;
    }
    case 'render': {
      const { state, tokens, info, option } = event.data;
      if (present == null || buffer == null) {
        for (const token of tokens) {
          if (token.tag !== 'Bitmap') { continue; }
          token.normal_bitmap.close();
          token.flashing_bitmap?.close();
        }
        break;
      }
      try {
        render(present, buffer, state, tokens, info, option);
      } catch (error) {
        // A malformed cue must not permanently disable later captions.
        self.postMessage(FromWorkerToMainEventRenderError.from(error));
      }

      break;
    }
    case 'imagebitmap': {
      if (present == null) {
        self.postMessage(FromWorkerToMainEventImageBitmap.from());
        break;
      }

      createImageBitmap(present).then((bitmap) => {
        try {
          workerScope.postMessage(FromWorkerToMainEventImageBitmap.from(bitmap), [bitmap]);
        } catch (error) {
          bitmap.close();
          self.postMessage(FromWorkerToMainEventImageBitmap.from());
        }
      }).catch(() => self.postMessage(FromWorkerToMainEventImageBitmap.from()));

      break;
    }
    default: {
      throw new ExhaustivenessError(event.data, `Exhaustive check failed in CanvasRenderingWorker`);
    }
    }
  } catch (error) {
    self.postMessage(FromWorkerToMainEventError.from(error));
  }
});
