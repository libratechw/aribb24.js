import { NotUsedDueToStandardError as e } from "../../util/error.mjs";
import t from "../../lib/parser/state/ARIB.mjs";
import n from "../../lib/parser/state/SBTVD.mjs";
import r from "../../lib/tokenizer/b24/jis8/ARIB/index.mjs";
import i from "../../lib/tokenizer/b24/jis8/SBTVD/index.mjs";
import a from "../../lib/tokenizer/b24/ucs/tokenizer.mjs";
//#region src/runtime/cli/info.ts
var o = (o, s, c = "UNKNOWN") => {
	if (s === 1) return [
		"ARIB",
		new a(),
		t
	];
	if (s !== 0) throw new e("Reserved TCS");
	switch (c) {
		case "ARIB": return [
			"ARIB",
			new r({ usePUA: !1 }),
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
			new r({ usePUA: !1 }),
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
		new r({ usePUA: !1 }),
		t
	];
};
//#endregion
export { o as getTokenizeInformation };
