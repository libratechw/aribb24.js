import { RendererOption } from "../renderer-option";
type HTMLFragmentRendererReplaceOption = {
    drcs: Map<string, string>;
};
type HTMLFragmentRendererColorOption = {
    foreground: boolean;
    stroke: boolean;
    background: string | null;
};
export type HTMLFragmentRendererOption = RendererOption & {
    replace: HTMLFragmentRendererReplaceOption;
    color: HTMLFragmentRendererColorOption;
};
export type PartialHTMLFragmentRendererOption = Partial<RendererOption & {
    replace: Partial<HTMLFragmentRendererReplaceOption>;
    color: Partial<HTMLFragmentRendererColorOption>;
}>;
export declare const HTMLFragmentRendererOption: {
    from(option?: PartialHTMLFragmentRendererOption): HTMLFragmentRendererOption;
};
export {};
//# sourceMappingURL=html-fragment-renderer-option.d.ts.map