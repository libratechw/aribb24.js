import e from "../../lib/tokenizer/b24/jis8/ARIB/symbol-pua.mjs";
import t from "../../lib/tokenizer/b24/jis8/ARIB/symbol-unicode.mjs";
//#region src/runtime/common/font.ts
var n = /* @__PURE__ */ new Set([]);
for (let t = 122; t < 127; t++) for (let r = 33; r < 127; r++) {
	let i = t << 8 | r;
	if (!e.has(i)) continue;
	let a = e.get(i);
	switch (a) {
		case "年":
		case "月":
		case "日":
		case "円": break;
		default:
			n.add(a);
			break;
	}
}
for (let e = 122; e < 127; e++) for (let r = 33; r < 127; r++) {
	let i = e << 8 | r;
	if (!t.has(i)) continue;
	let a = t.get(i);
	switch (a) {
		case "年":
		case "月":
		case "日":
		case "円": break;
		default:
			n.add(a);
			break;
	}
}
var r = (e) => !!n.has(e);
//#endregion
export { r as default };
