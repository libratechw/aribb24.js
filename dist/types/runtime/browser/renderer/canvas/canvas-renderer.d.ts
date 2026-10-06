import { ARIBB24ParserState } from "../../../../lib/parser/parser";
import { CaptionAssociationInformation } from "../../../../lib/demuxer/b24/datagroup";
import { ARIBB24BrowserToken } from "../../types";
import Renderer from "../renderer";
import { CanvasRendererOption, PartialCanvasRendererOption } from "./canvas-renderer-option";
export default abstract class CanvasRenderer implements Renderer {
    protected option: CanvasRendererOption;
    protected canvas: HTMLCanvasElement;
    constructor(option?: PartialCanvasRendererOption);
    abstract resize(width: number, height: number): void;
    abstract destroy(): void;
    abstract clear(): void;
    hide(): void;
    show(): void;
    abstract render(initialState: ARIBB24ParserState, tokens: ARIBB24BrowserToken[], info: CaptionAssociationInformation): void;
    onAttach(element: HTMLElement): void;
    onDetach(): void;
    onContainerResize(width: number, height: number): boolean;
    onVideoResize(width: number, height: number): boolean;
    onPlay(): void;
    onPause(): void;
    onSeeking(): void;
}
//# sourceMappingURL=canvas-renderer.d.ts.map