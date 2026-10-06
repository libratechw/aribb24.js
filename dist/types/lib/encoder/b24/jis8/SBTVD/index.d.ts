import { ARIBB24Token, ARIBB24BitmapToken, ARIBB24CharacterToken, ARIBB24DRCSToken, ARIBB24MosaicToken } from "../../../../tokenizer/token";
import ARIBB24Encoder from "../../encoder";
import { ARIBB24DataUnit } from "../../../../demuxer/b24/datagroup";
export default class ARIBB24BrazilianJIS8Encoder extends ARIBB24Encoder {
    static ASCII: Map<string, [number]>;
    static LATIN_EXTENSION: Map<string, number[]>;
    static SPECIAL_CHARACTERS: Map<string, number[]>;
    private drcs_md5_to_code;
    private current_drcs_code;
    private drcs_units;
    encode(tokens: ARIBB24Token[]): ARIBB24DataUnit[];
    encodeCharacter({ character }: ARIBB24CharacterToken): ArrayBuffer;
    encodeDRCS(drcs: ARIBB24DRCSToken): ArrayBuffer;
    encodeBitmap(bitmap: ARIBB24BitmapToken): ArrayBuffer;
    encodeMosaic(mozaic: ARIBB24MosaicToken): ArrayBuffer;
}
//# sourceMappingURL=index.d.ts.map