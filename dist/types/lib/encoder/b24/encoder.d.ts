import { ARIBB24Token, ARIBB24BitmapToken, ARIBB24CharacterToken, ARIBB24DRCSToken, ARIBB24MosaicToken } from "../../tokenizer/token";
import { ARIBB24DataUnit } from "../../demuxer/b24/datagroup";
export default abstract class ARIBB24Encoder {
    protected readonly encodeTokenHandler: (token: ARIBB24Token) => ArrayBufferLike;
    abstract encode(tokens: ARIBB24Token[]): ARIBB24DataUnit[];
    encodeToken(token: ARIBB24Token): ArrayBufferLike;
    encodeControl(control: Exclude<ARIBB24Token, ARIBB24CharacterToken | ARIBB24DRCSToken | ARIBB24BitmapToken | ARIBB24MosaicToken>): ArrayBufferLike;
    abstract encodeCharacter(character: ARIBB24CharacterToken): ArrayBufferLike;
    abstract encodeDRCS(drcs: ARIBB24DRCSToken): ArrayBufferLike;
    abstract encodeBitmap(bitmap: ARIBB24BitmapToken): ArrayBufferLike;
    abstract encodeMosaic(mozaic: ARIBB24MosaicToken): ArrayBufferLike;
}
//# sourceMappingURL=encoder.d.ts.map