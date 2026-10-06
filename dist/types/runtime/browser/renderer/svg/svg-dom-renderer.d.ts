import { ARIBB24ParserState } from "../../../../lib/parser/parser";
import { CaptionAssociationInformation } from "../../../../lib/demuxer/b24/datagroup";
import { ARIBB24BrowserToken } from "../../types";
import Renderer from "../renderer";
import { PartialSVGDOMRendererOption, SVGDOMRendererOption } from "./svg-dom-renderer-option";
export default class SVGDOMRenderer implements Renderer {
    protected option: SVGDOMRendererOption;
    protected svg: SVGSVGElement;
    constructor(option?: PartialSVGDOMRendererOption);
    resize(width: number, height: number): void;
    destroy(): void;
    clear(): void;
    hide(): void;
    show(): void;
    render(initialState: ARIBB24ParserState, tokens: ARIBB24BrowserToken[], info: CaptionAssociationInformation): void;
    onAttach(element: HTMLElement): void;
    onDetach(): void;
    onContainerResize(width: number, height: number): boolean;
    onVideoResize(width: number, height: number): boolean;
    onPlay(): void;
    onPause(): void;
    onSeeking(): void;
    getPresentationSVGElement(): SVGSVGElement;
}
//# sourceMappingURL=svg-dom-renderer.d.ts.map