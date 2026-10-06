import { CaptionAssociationInformation } from "../demuxer/b24/datagroup";
import { ARIBB24_CHARACTER_SIZE, ARIBB24CharacterParsedToken, ARIBB24DRCSParsedToken, ARIBB24ParsedToken } from "./parser";
export type ARIBB24ScriptParsedToken = {
    tag: 'Script';
    sup: ARIBB24CharacterParsedToken | ARIBB24DRCSParsedToken;
    sub: ARIBB24CharacterParsedToken | ARIBB24DRCSParsedToken;
};
export declare const ARIBB24ScriptParsedToken: {
    from(sup: ARIBB24CharacterParsedToken | ARIBB24DRCSParsedToken, sub: ARIBB24CharacterParsedToken | ARIBB24DRCSParsedToken): ARIBB24ScriptParsedToken;
};
export type ARIBB24RegionerToken = ARIBB24CharacterParsedToken | ARIBB24DRCSParsedToken | ARIBB24ScriptParsedToken;
export type ARIBB24NormalSpan = {
    tag: 'Normal';
    text: ARIBB24RegionerToken[];
};
export declare const ARIBB24NormalSpan: {
    from(text: ARIBB24RegionerToken[]): ARIBB24NormalSpan;
};
export type ARIBB24RubySpan = {
    tag: 'Ruby';
    text: ARIBB24RegionerToken[];
    ruby: ARIBB24RegionerToken[];
};
export declare const ARIBB24RubySpan: {
    from(text: ARIBB24RegionerToken[], ruby: ARIBB24RegionerToken[]): ARIBB24RubySpan;
};
export type ARIBB24Span = ARIBB24NormalSpan | ARIBB24RubySpan;
export type ARIBB24Region = {
    plane: [number, number];
    margin: [number, number];
    position: [number, number];
    area: [number, number];
    size: (typeof ARIBB24_CHARACTER_SIZE)[keyof typeof ARIBB24_CHARACTER_SIZE];
    fontsize: [number, number];
    background: number;
    highlight: boolean;
    spans: ARIBB24Span[];
};
export declare const SSZ_RUBY_DETECTION: {
    readonly GUESS: "GUESS_RUBY";
    readonly PRESERVE: "PRESERVE";
    readonly IGNORE: "IGNORE";
};
declare const _default: (tokens: ARIBB24ParsedToken[], info: CaptionAssociationInformation, ruby_handle_type: (typeof SSZ_RUBY_DETECTION)[keyof typeof SSZ_RUBY_DETECTION]) => ARIBB24Region[];
export default _default;
//# sourceMappingURL=regioner.d.ts.map