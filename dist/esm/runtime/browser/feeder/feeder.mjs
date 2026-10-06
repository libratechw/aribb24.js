import { NotUsedDueToStandardError as e } from "../../../util/error.mjs";
import t from "../../../lib/parser/state/ARIB.mjs";
import n from "../../../lib/parser/state/SBTVD.mjs";
import r from "../../../lib/tokenizer/b24/jis8/ARIB/index.mjs";
import i from "../../../lib/tokenizer/b24/jis8/SBTVD/index.mjs";
import a from "../../../lib/tokenizer/b24/ucs/tokenizer.mjs";
//#region src/runtime/browser/feeder/feeder.ts
var o = { from(e) {
	return {
		...e,
		recieve: {
			association: null,
			type: "Caption",
			language: 0,
			...e?.recieve
		},
		tokenizer: {
			pua: !1,
			...e?.tokenizer
		},
		offset: {
			time: 0,
			...e?.offset
		}
	};
} }, s = (o, s, c) => {
	if (s === 1) return [
		"ARIB",
		new a(),
		t
	];
	if (s !== 0) throw new e("not Supported TCS");
	switch (c.recieve.association) {
		case "ARIB": return [
			"ARIB",
			new r({ usePUA: c.tokenizer.pua }),
			t
		];
		case "SBTVD": return [
			"SBTVD",
			new i(),
			n
		];
	}
	switch (o) {
		case "jpn":
		case "eng": return [
			"ARIB",
			new r({ usePUA: c.tokenizer.pua }),
			t
		];
		case "spa":
		case "por": return [
			"SBTVD",
			new i(),
			n
		];
	}
	return [
		"UNKNOWN",
		new r({ usePUA: c.tokenizer.pua }),
		t
	];
};
//#endregion
export { o as FeederOption, s as getTokenizeInformation };
