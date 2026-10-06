import { ARIBB24ParserState } from "../../../../lib/parser/parser";
import CanvasRenderer from "./canvas-renderer";
import { CaptionAssociationInformation } from "../../../../lib/demuxer/b24/datagroup";
import { ARIBB24BrowserToken } from "../../types";
import { PartialCanvasRendererOption } from "./canvas-renderer-option";
export default class CanvasMainThreadRenderer extends CanvasRenderer {
    private buffer;
    constructor(option?: PartialCanvasRendererOption);
    resize(width: number, height: number): void;
    destroy(): void;
    clear(): void;
    render(initialState: ARIBB24ParserState, tokens: ARIBB24BrowserToken[], info: CaptionAssociationInformation): void;
    getPresentationCanvas(): HTMLCanvasElement;
}
//# sourceMappingURL=canvas-renderer-mainthread.d.ts.map