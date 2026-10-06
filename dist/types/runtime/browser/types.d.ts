import { ARIBB24Token, ARIBB24BitmapToken } from "../../lib/tokenizer/token";
import { ARIBB24BitmapParsedToken, ARIBB24CommonParsedToken, ARIBB24ParsedToken, ARIBB24ParserOption, ARIBB24ParserState } from "../../lib/parser/parser";
import { ARIBB24Region, SSZ_RUBY_DETECTION } from "../../lib/parser/regioner";
import { CaptionAssociationInformation } from "../../lib/demuxer/b24/datagroup";
export type DecodedBitmap = {
    tag: 'Bitmap';
    x_position: number;
    y_position: number;
    width: number;
    height: number;
    normal_dataurl: string;
    normal_bitmap: ImageBitmap;
    flashing_dataurl?: string;
    flashing_bitmap?: ImageBitmap;
};
export declare const DecodedBitmap: {
    from(bitmap: ARIBB24BitmapToken, pallet: string[]): Promise<DecodedBitmap>;
};
export type ARIBB24BrowserToken = Exclude<ARIBB24Token, ARIBB24BitmapToken> | DecodedBitmap;
export type ARIBB24BrowserBitmapParsedToken = ARIBB24CommonParsedToken & Omit<DecodedBitmap, 'tag'> & {
    tag: 'Bitmap';
};
export declare const ARIBB24BrowserBitmapParsedToken: {
    from(bitmap: DecodedBitmap, state: ARIBB24ParserState, option: ARIBB24ParserOption): ARIBB24BrowserBitmapParsedToken;
};
export type ARIBB24BrowserParsedToken = Exclude<ARIBB24ParsedToken, ARIBB24BitmapParsedToken> | ARIBB24BrowserBitmapParsedToken;
export declare const toBrowserTokenWithBitmap: (tokens: ARIBB24Token[], pallet: string[]) => Promise<ARIBB24BrowserToken[]>;
export declare const toBrowserTokenWithoutBitmap: (tokens: ARIBB24Token[]) => ARIBB24BrowserToken[];
export declare class ARIBB24BrowserParser {
    private praser;
    constructor(state?: Readonly<ARIBB24ParserState>, option?: ARIBB24ParserOption);
    currentState(): ARIBB24ParserState;
    currentOption(): ARIBB24ParserOption;
    private parseBitmapOrInherit;
    parse(tokens: ARIBB24BrowserToken[]): ARIBB24BrowserParsedToken[];
}
export declare const replaceDRCS: (tokens: ARIBB24BrowserToken[], replace: Map<string, string>) => ARIBB24BrowserToken[];
export declare const makeRegions: (tokens: ARIBB24BrowserParsedToken[], info: CaptionAssociationInformation, ruby_handle_type: (typeof SSZ_RUBY_DETECTION)[keyof typeof SSZ_RUBY_DETECTION]) => ARIBB24Region[];
//# sourceMappingURL=types.d.ts.map