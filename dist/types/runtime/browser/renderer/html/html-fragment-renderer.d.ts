import { ARIBB24ParserState } from "../../../../lib/parser/parser";
import Renderer from "../renderer";
import { PartialHTMLFragmentRendererOption } from "./html-fragment-renderer-option";
import { CaptionAssociationInformation } from "../../../../lib/demuxer/b24/datagroup";
import { ARIBB24BrowserToken } from "../../types";
export default class HTMLFragmentRenderer implements Renderer {
    private option;
    private element;
    constructor(option?: PartialHTMLFragmentRendererOption);
    resize(width: number, height: number): void;
    destroy(): void;
    clear(): void;
    hide(): void;
    show(): void;
    render(initialState: ARIBB24ParserState, tokens: ARIBB24BrowserToken[], info: CaptionAssociationInformation): void;
    onAttach(_: HTMLElement): void;
    onDetach(): void;
    onContainerResize(width: number, height: number): boolean;
    onVideoResize(width: number, height: number): boolean;
    onPlay(): void;
    onPause(): void;
    onSeeking(): void;
    getPresentationElement(): HTMLDivElement;
}
//# sourceMappingURL=html-fragment-renderer.d.ts.map