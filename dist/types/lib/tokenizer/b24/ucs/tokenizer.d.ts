import { ARIBB24Token } from '../../token';
import ARIBB24Tokenizer from "../tokenizer";
export default class ARIBB24UTF8Tokenizer extends ARIBB24Tokenizer {
    private segmenter;
    private decoder;
    private drcs;
    tokenizeStatement(data: Uint8Array): ARIBB24Token[];
    processDRCS(bytes: 1 | 2, data: Uint8Array): void;
}
//# sourceMappingURL=tokenizer.d.ts.map