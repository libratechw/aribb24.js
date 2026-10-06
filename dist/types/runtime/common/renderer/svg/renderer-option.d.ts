import type { PathElement } from "../../additional-symbols-glyph";
import { RendererOption } from "../renderer-option";
type SVGDOMRendererFontOption = {
    normal: string;
    arib?: string;
};
type SVGDOMRendererReplaceOption = {
    half: boolean;
    drcs: Map<string, string>;
    glyph: Map<string, PathElement>;
};
type SVGDOMRendererColorOption = {
    stroke: string | null;
    foreground: string | null;
    background: string | null;
};
type SVGDOMRendererAnimationOption = {
    pause: boolean;
};
export type SVGRendererOption = RendererOption & {
    font: SVGDOMRendererFontOption;
    replace: SVGDOMRendererReplaceOption;
    color: SVGDOMRendererColorOption;
    animation: SVGDOMRendererAnimationOption;
};
export type PartialSVGRendererOption = Partial<RendererOption & {
    font: Partial<SVGDOMRendererFontOption>;
    replace: Partial<SVGDOMRendererReplaceOption>;
    color: Partial<SVGDOMRendererColorOption>;
    animation: Partial<SVGDOMRendererAnimationOption>;
}>;
export declare const SVGRendererOption: {
    from(option?: PartialSVGRendererOption): SVGRendererOption;
};
export {};
//# sourceMappingURL=renderer-option.d.ts.map