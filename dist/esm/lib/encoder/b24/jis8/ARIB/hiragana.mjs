import e from "../../../../tokenizer/b24/jis8/ARIB/hiragana.mjs";
import t from "../halfwidth.mjs";
//#region src/lib/encoder/b24/jis8/ARIB/hiragana.ts
var n = new Map([...Array.from(e.entries()).map(([e, t]) => [t, [e]]), ...Array.from(e.entries()).filter(([e, n]) => t.has(n)).map(([e, n]) => [t.get(n), [e]])]);
//#endregion
export { n as default };
