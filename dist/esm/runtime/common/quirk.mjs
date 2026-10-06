import { ARIBB24_CHARACTER_SIZE as e } from "../../lib/parser/parser.mjs";
//#region src/runtime/common/quirk.ts
var t = (t, n) => n.association === "SBTVD" && t === e.Small || t === e.Middle;
//#endregion
export { t as shouldHalfWidth };
