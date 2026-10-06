import ARIBB24JIS8Tokenizer from "../tokenizer";
export type ARIBB24JapaneseJIS8TokenizerOption = {
    usePUA: boolean;
};
export default class ARIBB24JapaneseJIS8Tokenizer extends ARIBB24JIS8Tokenizer {
    static NORMAL_DICT_USE_PUA: {
        KANJI: {
            readonly type: "Character";
            readonly code: 66;
            readonly bytes: 2;
            readonly dict: Map<number, string>;
        };
        ASCII: {
            readonly type: "Character";
            readonly code: 74;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        HIRAGANA: {
            readonly type: "Character";
            readonly code: 48;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        KATANAKA: {
            readonly type: "Character";
            readonly code: 49;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        MOSAIC_A: {
            readonly type: "Character";
            readonly code: 50;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        MOSAIC_B: {
            readonly type: "Character";
            readonly code: 51;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        MOSAIC_C: {
            readonly type: "Character";
            readonly code: 52;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        MOSAIC_D: {
            readonly type: "Character";
            readonly code: 53;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        P_ASCII: {
            readonly type: "Character";
            readonly code: 54;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        P_HIRAGANA: {
            readonly type: "Character";
            readonly code: 55;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        P_KATANAKA: {
            readonly type: "Character";
            readonly code: 56;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        JIS_X_0201_KATAKANA: {
            readonly type: "Character";
            readonly code: 73;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        JIS_X_0213_2004_KANJI_1: {
            readonly type: "Character";
            readonly code: 57;
            readonly bytes: 2;
            readonly dict: Map<number, string>;
        };
        JIS_X_0213_2004_KANJI_2: {
            readonly type: "Character";
            readonly code: 58;
            readonly bytes: 2;
            readonly dict: Map<number, string>;
        };
        ADDITIONAL_SYMBOLS: {
            readonly type: "Character";
            readonly code: 59;
            readonly bytes: 2;
            readonly dict: Map<number, string>;
        };
    };
    static NORMAL_DICT_USE_UNICODE: {
        KANJI: {
            readonly type: "Character";
            readonly code: 66;
            readonly bytes: 2;
            readonly dict: Map<number, string>;
        };
        ASCII: {
            readonly type: "Character";
            readonly code: 74;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        HIRAGANA: {
            readonly type: "Character";
            readonly code: 48;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        KATANAKA: {
            readonly type: "Character";
            readonly code: 49;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        MOSAIC_A: {
            readonly type: "Character";
            readonly code: 50;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        MOSAIC_B: {
            readonly type: "Character";
            readonly code: 51;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        MOSAIC_C: {
            readonly type: "Character";
            readonly code: 52;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        MOSAIC_D: {
            readonly type: "Character";
            readonly code: 53;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        P_ASCII: {
            readonly type: "Character";
            readonly code: 54;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        P_HIRAGANA: {
            readonly type: "Character";
            readonly code: 55;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        P_KATANAKA: {
            readonly type: "Character";
            readonly code: 56;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        JIS_X_0201_KATAKANA: {
            readonly type: "Character";
            readonly code: 73;
            readonly bytes: 1;
            readonly dict: Map<number, string>;
        };
        JIS_X_0213_2004_KANJI_1: {
            readonly type: "Character";
            readonly code: 57;
            readonly bytes: 2;
            readonly dict: Map<number, string>;
        };
        JIS_X_0213_2004_KANJI_2: {
            readonly type: "Character";
            readonly code: 58;
            readonly bytes: 2;
            readonly dict: Map<number, string>;
        };
        ADDITIONAL_SYMBOLS: {
            readonly type: "Character";
            readonly code: 59;
            readonly bytes: 2;
            readonly dict: Map<number, string>;
        };
    };
    constructor(option?: ARIBB24JapaneseJIS8TokenizerOption);
}
//# sourceMappingURL=index.d.ts.map