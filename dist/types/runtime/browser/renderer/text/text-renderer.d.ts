import { ARIBB24ParserState } from "../../../../lib/parser/parser";
import Renderer from "../renderer";
import { TextRendererOption } from "./text-renderer-option";
import { CaptionAssociationInformation } from "../../../../lib/demuxer/b24/datagroup";
import { ARIBB24BrowserToken } from "../../types";
export default class TextRenderer implements Renderer {
    private option;
    private text;
    constructor(option?: Partial<TextRendererOption>);
    getText(): string | null;
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
}
//# sourceMappingURL=text-renderer.d.ts.map