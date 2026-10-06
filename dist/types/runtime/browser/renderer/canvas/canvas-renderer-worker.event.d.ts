import { ARIBB24ParserState } from "../../../../lib/parser/parser";
import { CaptionAssociationInformation } from "../../../../lib/demuxer/b24/datagroup";
import { ARIBB24BrowserToken } from "../../types";
import { CanvasRendererOption } from "./canvas-renderer-option";
export type FromMainToWorkerEventInitialize = {
    type: 'initialize';
    present: OffscreenCanvas;
    buffer: OffscreenCanvas;
};
export declare const FromMainToWorkerEventInitialize: {
    from(present: OffscreenCanvas, buffer: OffscreenCanvas): FromMainToWorkerEventInitialize;
};
export type FromMainToWorkerEventClear = {
    type: 'clear';
};
export declare const FromMainToWorkerEventClear: {
    from(): FromMainToWorkerEventClear;
};
export type FromMainToWorkerEventTerminate = {
    type: 'terminate';
};
export declare const FromMainToWorkerEventTerminate: {
    from(): FromMainToWorkerEventTerminate;
};
export type FromMainToWorkerEventResize = {
    type: 'resize';
    width: number;
    height: number;
};
export declare const FromMainToWorkerEventResize: {
    from(width: number, height: number): FromMainToWorkerEventResize;
};
export type FromMainToWorkerEventRender = {
    type: 'render';
    state: ARIBB24ParserState;
    tokens: ARIBB24BrowserToken[];
    info: CaptionAssociationInformation;
    option: CanvasRendererOption;
};
export declare const FromMainToWorkerEventRender: {
    from(state: ARIBB24ParserState, tokens: ARIBB24BrowserToken[], info: CaptionAssociationInformation, option: CanvasRendererOption): FromMainToWorkerEventRender;
};
export type FromMainToWorkerEventImageBitmap = {
    type: 'imagebitmap';
};
export declare const FromMainToWorkerEventImageBitmap: {
    from(): FromMainToWorkerEventImageBitmap;
};
export type FromMainToWorkerEvent = FromMainToWorkerEventInitialize | FromMainToWorkerEventClear | FromMainToWorkerEventTerminate | FromMainToWorkerEventResize | FromMainToWorkerEventRender | FromMainToWorkerEventImageBitmap;
export type FromWorkerToMainEventImageBitmap = {
    type: 'imagebitmap';
    bitmap: ImageBitmap | null;
};
export declare const FromWorkerToMainEventImageBitmap: {
    from(bitmap?: ImageBitmap): FromWorkerToMainEventImageBitmap;
};
export type FromWorkerToMainEventError = {
    type: 'error';
    message: string;
};
export declare const FromWorkerToMainEventError: {
    from(error: unknown): FromWorkerToMainEventError;
};
export type FromWorkerToMainEventRenderError = {
    type: 'render-error';
    message: string;
};
export declare const FromWorkerToMainEventRenderError: {
    from(error: unknown): FromWorkerToMainEventRenderError;
};
export type FromWorkerToMainEvent = FromWorkerToMainEventImageBitmap | FromWorkerToMainEventError | FromWorkerToMainEventRenderError;
//# sourceMappingURL=canvas-renderer-worker.event.d.ts.map