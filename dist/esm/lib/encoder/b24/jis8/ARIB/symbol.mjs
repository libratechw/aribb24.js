import e from "../../../../tokenizer/b24/jis8/ARIB/symbol-pua.mjs";
import t from "../../../../tokenizer/b24/jis8/ARIB/symbol-unicode.mjs";
//#region src/lib/encoder/b24/jis8/ARIB/symbol.ts
var n = new Map([...Array.from(e.entries()).map(([e, t]) => [t, [(e & 65280) >> 8, (e & 255) >> 0]]), ...Array.from(t.entries()).map(([e, t]) => [t, [(e & 65280) >> 8, (e & 255) >> 0]])]);
//#endregion
export { n as default };
