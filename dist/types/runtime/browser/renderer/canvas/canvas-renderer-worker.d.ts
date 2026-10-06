import { ARIBB24ParserState } from "../../../../lib/parser/parser";
import CanvasRenderer from "./canvas-renderer";
import { CaptionAssociationInformation } from "../../../../lib/demuxer/b24/datagroup";
import { ARIBB24BrowserToken } from "../../types";
import { PartialCanvasRendererOption } from "./canvas-renderer-option";
export default class CanvasWebWorkerRenderer extends CanvasRenderer {
    private readonly onFailure?;
    private buffer;
    private present;
    private worker;
    private failed;
    private destroyed;
    private waitPromise;
    private waitResolve;
    private bitmapResolve;
    constructor(option?: PartialCanvasRendererOption, onFailure?: ((error: Error) => void) | undefined);
    private readonly onWorkerMessage;
    private readonly onWorkerError;
    private readonly onWorkerMessageError;
    private settleBitmap;
    private fail;
    resize(width: number, height: number): void;
    destroy(): void;
    clear(): void;
    render(initialState: ARIBB24ParserState, tokens: ARIBB24BrowserToken[], info: CaptionAssociationInformation): void;
    getPresentationImageBitmap(): Promise<ImageBitmap | null>;
}
//# sourceMappingURL=canvas-renderer-worker.d.ts.map