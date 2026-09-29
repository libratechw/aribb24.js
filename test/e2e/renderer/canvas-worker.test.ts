import { describe, expect, test, vi } from 'vitest';

import { CanvasWebWorkerRenderer } from '@/index';
import aribInitialState from '@/lib/parser/state/ARIB';
import { CaptionAssociationInformation } from '@/lib/demuxer/b24/datagroup';
import { ARIBB24CharacterToken } from '@/lib/tokenizer/token';
import { DecodedBitmap } from '@/runtime/browser/types';

const info: CaptionAssociationInformation = { association: 'ARIB', language: 'und' };

describe('ARIB B24 Worker Canvas Renderer', () => {
  test('transfers its Bitmap copy and resolves image requests after rendering', async () => {
    const source = document.createElement('canvas');
    source.width = source.height = 2;
    source.getContext('2d')!.fillRect(0, 0, 2, 2);
    const bitmap = await createImageBitmap(source);
    const token: DecodedBitmap = {
      tag: 'Bitmap', x_position: 0, y_position: 0, width: 2, height: 2,
      normal_dataurl: '', normal_bitmap: bitmap,
    };
    const renderer = new CanvasWebWorkerRenderer();
    try {
      renderer.onAttach(document.body);
      renderer.onContainerResize(64, 64);
      renderer.render(aribInitialState, [token], info);
      expect(bitmap.width).toBe(0);
      const presented = await renderer.getPresentationImageBitmap();
      expect(presented?.width).toBe(64);
      presented?.close();
    } finally {
      renderer.onDetach();
      renderer.destroy();
      bitmap.close();
    }
  });

  test('keeps rendering after one malformed cue', async () => {
    const report = vi.fn();
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    const renderer = new CanvasWebWorkerRenderer(undefined, report);
    try {
      renderer.onAttach(document.body);
      renderer.onContainerResize(64, 64);
      renderer.render(aribInitialState, [ARIBB24CharacterToken.from('A')], null as never);
      await vi.waitFor(() => expect(logged).toHaveBeenCalledWith(
        '[aribb24.js] Caption rendering failed:', expect.any(String)));
      renderer.render(aribInitialState, [ARIBB24CharacterToken.from('B')], info);
      const presented = await renderer.getPresentationImageBitmap();
      expect(presented?.width).toBe(64);
      presented?.close();
      expect(report).not.toHaveBeenCalled();
    } finally {
      renderer.onDetach();
      renderer.destroy();
      logged.mockRestore();
    }
  });

  test('reports a synchronous resize-send failure after the Controller pass', async () => {
    const postMessage = Worker.prototype.postMessage;
    const intercepted = vi.spyOn(Worker.prototype, 'postMessage').mockImplementation(function(this: Worker, message: any, transfer?: Transferable[]) {
      if (message?.type === 'resize') { throw new Error('resize message rejected'); }
      postMessage.call(this, message, transfer ?? []);
    });
    let inResize = false;
    let reportedInsideResize: boolean | null = null;
    let resolveFailure!: () => void;
    const failure = new Promise<void>((resolve) => { resolveFailure = resolve; });
    try {
      const renderer = new CanvasWebWorkerRenderer(undefined, () => {
        reportedInsideResize = inResize;
        resolveFailure();
      });
      try {
        renderer.onAttach(document.body);
        inResize = true;
        renderer.onContainerResize(64, 64);
        inResize = false;
        await failure;
        expect(reportedInsideResize).toBe(false);
      } finally {
        renderer.onDetach();
        renderer.destroy();
      }
    } finally {
      intercepted.mockRestore();
    }
  });
});
