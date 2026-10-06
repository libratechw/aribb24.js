import { ARIBB24ParsedToken } from "../../../../lib/parser/parser";
import { CaptionAssociationInformation } from "../../../../lib/demuxer/b24/datagroup";
import { SVGRendererOption } from "./renderer-option";
export type SVGNode = string | {
    name: string;
    xmlns: string;
    attributes: Record<string, string>;
    children: SVGNode[];
};
export declare const SVGNode: {
    from(xmlns: string, name: string, attributes?: Record<string, string>, children?: SVGNode[]): {
        name: string;
        xmlns: string;
        attributes: Record<string, string>;
        children: SVGNode[];
    };
};
export declare const serializeSVG: (node: SVGNode, depth?: number) => string;
declare const _default: (tokens: ARIBB24ParsedToken[], info: CaptionAssociationInformation, rendererOption: SVGRendererOption, enclosure?: boolean) => Exclude<SVGNode, string>;
export default _default;
//# sourceMappingURL=renderer-strategy.d.ts.map