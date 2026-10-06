import { PathElement } from "../../additional-symbols-glyph";
import { RendererOption } from "../renderer-option";
type RendererFontOption = {
    normal: string;
    arib?: string;
};
type RendererReplaceOption = {
    half: boolean;
    drcs: Map<string, string>;
    glyph: Map<string, PathElement>;
};
type RendererColorOption = {
    stroke: string | null;
    foreground: string | null;
    background: string | null;
};
type RendererResizeOption = {
    target: 'video' | 'container';
    objectFit: 'contain' | 'none';
};
export type CanvasRendererOption = RendererOption & {
    font: RendererFontOption;
    replace: RendererReplaceOption;
    color: RendererColorOption;
    resize: RendererResizeOption;
};
export type PartialCanvasRendererOption = Partial<RendererOption & {
    font: Partial<RendererFontOption>;
    replace: Partial<RendererReplaceOption>;
    color: Partial<RendererColorOption>;
    resize: Partial<RendererResizeOption>;
}>;
export declare const CanvasRendererOption: {
    from(option?: PartialCanvasRendererOption): CanvasRendererOption;
};
export {};
//# sourceMappingURL=renderer-option.d.ts.map