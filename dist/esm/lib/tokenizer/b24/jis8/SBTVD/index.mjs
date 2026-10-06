import e from "../ascii.mjs";
import t from "../tokenizer.mjs";
import n from "./latin-extension.mjs";
import r from "./special-characters.mjs";
//#region src/lib/tokenizer/b24/jis8/SBTVD/index.ts
var i = {
	ASCII: {
		type: "Character",
		code: 74,
		bytes: 1,
		dict: e
	},
	LATIN_EXTENSION: {
		type: "Character",
		code: 75,
		bytes: 1,
		dict: n
	},
	SPECIAL_CHARACTERS: {
		type: "Character",
		code: 76,
		bytes: 1,
		dict: r
	}
}, a = {}, o = class extends t {
	constructor() {
		super(0, 2, [
			i.ASCII,
			i.ASCII,
			i.LATIN_EXTENSION,
			i.SPECIAL_CHARACTERS
		], i, a, /* @__PURE__ */ new Set([]));
	}
};
//#endregion
export { o as default };
