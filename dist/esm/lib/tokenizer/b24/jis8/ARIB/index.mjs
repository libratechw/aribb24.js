import e from "../ascii.mjs";
import t from "../tokenizer.mjs";
import n from "./hiragana.mjs";
import r from "./katakana.mjs";
import i from "./symbol-pua.mjs";
import a from "./symbol-unicode.mjs";
//#region src/lib/tokenizer/b24/jis8/ARIB/index.ts
var o = new Map([
	[96, Uint8Array.from([
		27,
		36,
		66,
		27,
		41,
		74,
		27,
		42,
		48,
		27,
		43,
		32,
		112,
		15,
		27,
		125
	])],
	[97, Uint8Array.from([
		27,
		36,
		66,
		27,
		41,
		49,
		27,
		42,
		48,
		27,
		43,
		32,
		112,
		15,
		27,
		125
	])],
	[98, Uint8Array.from([
		27,
		36,
		66,
		27,
		41,
		32,
		65,
		27,
		42,
		48,
		27,
		43,
		32,
		112,
		15,
		27,
		125
	])],
	[99, Uint8Array.from([
		27,
		40,
		50,
		27,
		41,
		52,
		27,
		42,
		53,
		27,
		43,
		32,
		112,
		15,
		27,
		125
	])],
	[100, Uint8Array.from([
		27,
		40,
		50,
		27,
		41,
		51,
		27,
		42,
		53,
		27,
		43,
		32,
		112,
		15,
		27,
		125
	])],
	[101, Uint8Array.from([
		27,
		40,
		50,
		27,
		41,
		32,
		65,
		27,
		42,
		53,
		27,
		43,
		32,
		112,
		15,
		27,
		125
	])],
	[102, Uint8Array.from([
		27,
		40,
		32,
		65,
		27,
		41,
		32,
		66,
		27,
		42,
		32,
		67,
		27,
		43,
		32,
		112,
		15,
		27,
		125
	])],
	[103, Uint8Array.from([
		27,
		40,
		32,
		68,
		27,
		41,
		32,
		69,
		27,
		42,
		32,
		70,
		27,
		43,
		32,
		112,
		15,
		27,
		125
	])],
	[104, Uint8Array.from([
		27,
		40,
		32,
		71,
		27,
		41,
		32,
		72,
		27,
		42,
		32,
		73,
		27,
		43,
		32,
		112,
		15,
		27,
		125
	])],
	[105, Uint8Array.from([
		27,
		40,
		32,
		74,
		27,
		41,
		32,
		75,
		27,
		42,
		32,
		75,
		27,
		43,
		32,
		112,
		15,
		27,
		125
	])],
	[106, Uint8Array.from([
		27,
		40,
		32,
		77,
		27,
		41,
		32,
		78,
		27,
		42,
		32,
		79,
		27,
		43,
		32,
		112,
		15,
		27,
		125
	])],
	[107, Uint8Array.from([
		27,
		36,
		66,
		27,
		41,
		32,
		66,
		27,
		42,
		48,
		27,
		43,
		32,
		112,
		15,
		27,
		125
	])],
	[108, Uint8Array.from([
		27,
		36,
		66,
		27,
		41,
		32,
		67,
		27,
		42,
		48,
		27,
		43,
		32,
		112,
		15,
		27,
		125
	])],
	[109, Uint8Array.from([
		27,
		36,
		66,
		27,
		41,
		32,
		68,
		27,
		42,
		48,
		27,
		43,
		32,
		112,
		15,
		27,
		125
	])],
	[110, Uint8Array.from([
		27,
		40,
		49,
		27,
		41,
		48,
		27,
		42,
		74,
		27,
		43,
		32,
		112,
		15,
		27,
		125
	])],
	[111, Uint8Array.from([
		27,
		40,
		74,
		27,
		41,
		50,
		27,
		42,
		32,
		65,
		27,
		43,
		32,
		112,
		15,
		27,
		125
	])]
]), s = {
	KANJI: {
		type: "Character",
		code: 66,
		bytes: 2,
		dict: /* @__PURE__ */ new Map()
	},
	ASCII: {
		type: "Character",
		code: 74,
		bytes: 1,
		dict: e
	},
	HIRAGANA: {
		type: "Character",
		code: 48,
		bytes: 1,
		dict: n
	},
	KATANAKA: {
		type: "Character",
		code: 49,
		bytes: 1,
		dict: r
	},
	MOSAIC_A: {
		type: "Character",
		code: 50,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	MOSAIC_B: {
		type: "Character",
		code: 51,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	MOSAIC_C: {
		type: "Character",
		code: 52,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	MOSAIC_D: {
		type: "Character",
		code: 53,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	P_ASCII: {
		type: "Character",
		code: 54,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	P_HIRAGANA: {
		type: "Character",
		code: 55,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	P_KATANAKA: {
		type: "Character",
		code: 56,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	JIS_X_0201_KATAKANA: {
		type: "Character",
		code: 73,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	JIS_X_0213_2004_KANJI_1: {
		type: "Character",
		code: 57,
		bytes: 2,
		dict: /* @__PURE__ */ new Map()
	},
	JIS_X_0213_2004_KANJI_2: {
		type: "Character",
		code: 58,
		bytes: 2,
		dict: /* @__PURE__ */ new Map()
	},
	ADDITIONAL_SYMBOLS: {
		type: "Character",
		code: 59,
		bytes: 2,
		dict: /* @__PURE__ */ new Map()
	}
}, c = {
	DRCS_0: {
		type: "DRCS",
		code: 64,
		bytes: 2,
		dict: /* @__PURE__ */ new Map()
	},
	DRCS_1: {
		type: "DRCS",
		code: 65,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	DRCS_2: {
		type: "DRCS",
		code: 66,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	DRCS_3: {
		type: "DRCS",
		code: 67,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	DRCS_4: {
		type: "DRCS",
		code: 68,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	DRCS_5: {
		type: "DRCS",
		code: 69,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	DRCS_6: {
		type: "DRCS",
		code: 70,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	DRCS_7: {
		type: "DRCS",
		code: 71,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	DRCS_8: {
		type: "DRCS",
		code: 72,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	DRCS_9: {
		type: "DRCS",
		code: 73,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	DRCS_10: {
		type: "DRCS",
		code: 74,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	DRCS_11: {
		type: "DRCS",
		code: 75,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	DRCS_12: {
		type: "DRCS",
		code: 76,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	DRCS_13: {
		type: "DRCS",
		code: 77,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	DRCS_14: {
		type: "DRCS",
		code: 78,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	DRCS_15: {
		type: "DRCS",
		code: 79,
		bytes: 1,
		dict: /* @__PURE__ */ new Map()
	},
	MACRO: {
		type: "MACRO",
		code: 112,
		bytes: 1,
		dict: o
	}
}, l = class e extends t {
	static NORMAL_DICT_USE_PUA = { ...s };
	static NORMAL_DICT_USE_UNICODE = { ...s };
	static {
		let e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), n = new TextDecoder("euc-jp", { fatal: !0 });
		for (let r = 33; r < 117; r++) for (let i = 33; i < 127; i++) try {
			let a = r << 8 | i, o = n.decode(Uint8Array.from([r | 128, i | 128]));
			e.set(a, o), t.set(a, o);
		} catch {}
		for (let t = 117; t < 127; t++) for (let n = 33; n < 127; n++) {
			let r = t << 8 | n;
			i.has(r) && e.set(r, i.get(r));
		}
		for (let e = 117; e < 127; e++) for (let n = 33; n < 127; n++) {
			let r = e << 8 | n;
			a.has(r) && t.set(r, a.get(r));
		}
		this.NORMAL_DICT_USE_PUA = {
			...s,
			KANJI: {
				...s.KANJI,
				dict: e
			},
			ADDITIONAL_SYMBOLS: {
				...s.ADDITIONAL_SYMBOLS,
				dict: e
			}
		}, this.NORMAL_DICT_USE_UNICODE = {
			...s,
			KANJI: {
				...s.KANJI,
				dict: t
			},
			ADDITIONAL_SYMBOLS: {
				...s.ADDITIONAL_SYMBOLS,
				dict: t
			}
		};
	}
	constructor(t) {
		let n = t?.usePUA ? e.NORMAL_DICT_USE_PUA : e.NORMAL_DICT_USE_UNICODE;
		super(0, 2, [
			n.KANJI,
			n.ASCII,
			n.HIRAGANA,
			c.MACRO
		], n, c, new Set([
			"´",
			"`",
			"｀",
			"¨",
			"^",
			"＾",
			"‾",
			"￣",
			"_",
			"＿",
			"◯"
		]));
	}
};
//#endregion
export { l as default };
