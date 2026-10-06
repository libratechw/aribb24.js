import { ARIBB24Token, ARIBB24CharacterToken, ARIBB24DRCSToken, ARIBB24FlashingControlType, ARIBB24BitmapToken } from "../tokenizer/token";
export declare const ARIBB24_CHARACTER_SIZE: {
    readonly Small: "Small";
    readonly Middle: "Middle";
    readonly Normal: "Normal";
    readonly Tiny: "Tiny";
    readonly DoubleHeight: "DoubleHeight";
    readonly DoubleWidth: "DoubleWidth";
    readonly DoubleHeightAndWidth: "DoubleHeightAndWidth";
    readonly Special1: "Special1";
    readonly Special2: "Special2";
};
export declare const ARIBB24_CHARACTER_SIZE_MAP: Map<"Normal" | "Small" | "Middle" | "Tiny" | "DoubleHeight" | "DoubleWidth" | "DoubleHeightAndWidth" | "Special1" | "Special2", [number, number]>;
export type ARIBB24ParserState = {
    plane: [number, number];
    area: [number, number];
    margin: [number, number];
    fontsize: [number, number];
    hspace: number;
    vspace: number;
    position: [number, number];
    size: (typeof ARIBB24_CHARACTER_SIZE)[keyof typeof ARIBB24_CHARACTER_SIZE];
    pallet: number;
    foreground: number;
    background: number;
    halfforeground: number;
    halfbackground: number;
    underline: boolean;
    highlight: number;
    ornament: number | null;
    flashing: (typeof ARIBB24FlashingControlType)[keyof typeof ARIBB24FlashingControlType];
    elapsed_time: number;
};
export type ARIBB24ParserOption = {
    magnification: number;
};
export declare const ARIBB24ParserOption: {
    from(option?: Partial<ARIBB24ParserOption>): ARIBB24ParserOption;
};
export declare const initialState: Readonly<ARIBB24ParserState>;
export type ARIBB24CommonParsedToken = {
    state: ARIBB24ParserState;
    option: ARIBB24ParserOption;
};
export type ARIBB24ClearScreenParsedToken = ARIBB24CommonParsedToken & {
    tag: 'ClearScreen';
    time: number;
};
export declare const ARIBB24ClearScreenParsedToken: {
    from(time: number, state: ARIBB24ParserState, option: ARIBB24ParserOption): ARIBB24ClearScreenParsedToken;
};
export type ARIBB24CharacterParsedToken = ARIBB24CommonParsedToken & Omit<ARIBB24CharacterToken, 'tag'> & {
    tag: 'Character';
};
export declare const ARIBB24CharacterParsedToken: {
    from({ character, non_spacing }: Omit<ARIBB24CharacterToken, "tag">, state: ARIBB24ParserState, option: ARIBB24ParserOption): ARIBB24CharacterParsedToken;
};
export type ARIBB24DRCSParsedToken = ARIBB24CommonParsedToken & Omit<ARIBB24DRCSToken, 'tag' | 'combining'> & {
    tag: 'DRCS';
};
export declare const ARIBB24DRCSParsedToken: {
    from({ width, height, depth, binary }: ARIBB24DRCSToken, state: ARIBB24ParserState, option: ARIBB24ParserOption): ARIBB24DRCSParsedToken;
};
export type ARIBB24BitmapParsedToken = ARIBB24CommonParsedToken & Omit<ARIBB24BitmapToken, 'tag'> & {
    tag: 'Bitmap';
};
export type ARIBB24BitmapParsedTokenDataURLResult = {
    width: number;
    height: number;
    normal_dataurl: string;
    flashing_dataurl?: string;
};
export declare const ARIBB24BitmapParsedToken: {
    from({ x_position, y_position, flc_colors, binary }: ARIBB24BitmapToken, state: ARIBB24ParserState, option: ARIBB24ParserOption): ARIBB24BitmapParsedToken;
    toDataURL(token: ARIBB24BitmapParsedToken, pallet: string[]): ARIBB24BitmapParsedTokenDataURLResult;
};
export type ARIBB24ParsedToken = ARIBB24ClearScreenParsedToken | ARIBB24CharacterParsedToken | ARIBB24DRCSParsedToken | ARIBB24BitmapParsedToken;
export declare class ARIBB24Parser {
    private state;
    private option;
    private non_spacings;
    constructor(state?: Readonly<ARIBB24ParserState>, option?: ARIBB24ParserOption);
    static box(state: ARIBB24ParserState): [number, number];
    static offset(state: ARIBB24ParserState): [number, number];
    static scale(state: ARIBB24ParserState): [number, number];
    private move_absolute_dot;
    private move_absolute_pos;
    private move_newline;
    private move_relative_pos;
    currentState(): ARIBB24ParserState;
    currentOption(): ARIBB24ParserOption;
    parseToken(token: ARIBB24Token): ARIBB24ParsedToken[];
    parse(tokens: ARIBB24Token[]): ARIBB24ParsedToken[];
}
//# sourceMappingURL=parser.d.ts.map