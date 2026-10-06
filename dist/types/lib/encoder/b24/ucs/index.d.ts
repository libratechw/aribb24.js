import { ARIBB24Token, ARIBB24BitmapToken, ARIBB24CharacterToken, ARIBB24DRCSToken, ARIBB24MosaicToken } from "../../../tokenizer/token";
import ARIBB24Encoder from "../encoder";
import { ARIBB24DataUnit } from "../../../demuxer/b24/datagroup";
export default class ARIBB24UTF8Encoder extends ARIBB24Encoder {
    private current_drcs_code;
    private drcs_units;
    private drcs_md5_to_code;
    private encoder;
    encodeCharacter({ character }: ARIBB24CharacterToken): ArrayBuffer;
    encode(tokens: ARIBB24Token[]): ARIBB24DataUnit[];
    encodeControl(control: Exclude<ARIBB24Token, ARIBB24CharacterToken | ARIBB24DRCSToken | ARIBB24BitmapToken | ARIBB24MosaicToken>): ArrayBufferLike;
    encodeDRCS(drcs: ARIBB24DRCSToken): ArrayBufferLike;
    encodeBitmap(bitmap: ARIBB24BitmapToken): ArrayBuffer;
    encodeMosaic(mozaic: ARIBB24MosaicToken): ArrayBuffer;
}
//# sourceMappingURL=index.d.ts.map