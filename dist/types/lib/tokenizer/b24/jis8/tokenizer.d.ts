import type { ARIBB24Token } from '../../token';
import { ARIBB24DRCSToken } from "../../token";
import ARIBB24Tokenizer from "../tokenizer";
export declare const ESC_CODES: {
    readonly LS2: 110;
    readonly LS3: 111;
    readonly LS1R: 126;
    readonly LS2R: 125;
    readonly LS3R: 124;
};
export declare const DictEntryType: {
    readonly Character: "Character";
    readonly DRCS: "DRCS";
    readonly MACRO: "MACRO";
};
export type CharacterDictEntry = {
    type: (typeof DictEntryType.Character);
    code: number;
    bytes: number;
    dict: Map<number, string>;
};
export type DRCSDictEntry = {
    type: (typeof DictEntryType.DRCS);
    code: number;
    bytes: number;
    dict: Map<number, ARIBB24DRCSToken>;
};
export type MacroDictEntry = {
    type: (typeof DictEntryType.MACRO);
    code: number;
    bytes: number;
    dict: Map<number, Uint8Array>;
};
export type DictEntry = CharacterDictEntry | DRCSDictEntry | MacroDictEntry;
export default abstract class ARIBB24JIS8Tokenizer extends ARIBB24Tokenizer {
    private GL;
    private GR;
    private GB;
    private character_dicts;
    private drcs_dicts;
    private non_spacing;
    constructor(GL: 0 | 1 | 2 | 3, GR: 0 | 1 | 2 | 3, GB: [DictEntry, DictEntry, DictEntry, DictEntry], character_dicts: Record<string, CharacterDictEntry>, drcs_dicts: Record<string, DRCSDictEntry | MacroDictEntry>, non_spacing: Set<string>);
    tokenizeStatement(data: Uint8Array): ARIBB24Token[];
    processDRCS(bytes: 1 | 2, data: Uint8Array): void;
}
//# sourceMappingURL=tokenizer.d.ts.map