import { RendererOption } from "../renderer-option";
export type TextRendererOption = RendererOption & {
    replace: {
        half: boolean;
        drcs: Map<string, string>;
    };
};
export declare const TextRendererOption: {
    from(option?: Partial<TextRendererOption>): TextRendererOption;
};
//# sourceMappingURL=text-renderer-option.d.ts.map