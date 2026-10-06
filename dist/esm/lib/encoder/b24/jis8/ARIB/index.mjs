import { ExhaustivenessError as e, NotImplementedError as t, NotUsedDueToStandardError as n } from "../../../../../util/error.mjs";
import r from "../../../../../util/md5.mjs";
import { CONTROL_CODES as i } from "../../../../tokenizer/b24/tokenizer.mjs";
import { ESC_CODES as a } from "../../../../tokenizer/b24/jis8/tokenizer.mjs";
import { ARIBB24DRCSDataUnit as o, ARIBB24StatementDataUnit as s } from "../../../../demuxer/b24/datagroup.mjs";
import c from "../../encoder.mjs";
import l from "../../../../../util/concat.mjs";
import u from "./hiragana.mjs";
import d from "../ascii.mjs";
import f from "./katakana.mjs";
import p from "./symbol.mjs";
//#region src/lib/encoder/b24/jis8/ARIB/index.ts
var m = class m extends c {
	static KANJI = /* @__PURE__ */ new Map();
	static ASCII = structuredClone(d);
	static HIRAGANA = structuredClone(u);
	static KATAKANA = structuredClone(f);
	static {
		let e = new TextDecoder("euc-jp", { fatal: !0 });
		for (let t = 33; t < 117; t++) for (let n = 33; n < 127; n++) try {
			let r = e.decode(Uint8Array.from([t | 128, n | 128]));
			m.KANJI.set(r, [t, n]);
		} catch {}
		for (let [e, t] of p.entries()) m.KANJI.set(e, t);
	}
	mode = "MACRO0";
	drcs_md5_to_code = /* @__PURE__ */ new Map();
	current_drcs_code = [33, 33];
	drcs_units = [];
	encode(e) {
		let t = l(Uint8Array.from([i.ESC, a.LS1R]).buffer, ...e.map(this.encodeTokenHandler));
		return [...this.drcs_units, s.from(new Uint8Array(t))];
	}
	encodeCharacter({ character: t }) {
		if (m.ASCII.has(t)) switch (this.mode) {
			case "MACRO0": return Uint8Array.from([...m.ASCII.get(t).map((e) => e | 128)]).buffer;
			case "MACRO1": return this.mode = "MACRO0", Uint8Array.from([
				i.SS3,
				96,
				i.ESC,
				a.LS1R,
				...m.ASCII.get(t).map((e) => e | 128)
			]).buffer;
			default: throw new e(this.mode, "Unexpected mode in ARIBB24JapaneseJIS8Encoder");
		}
		else if (m.HIRAGANA.has(t)) return Uint8Array.from([i.SS2, ...m.HIRAGANA.get(t)]).buffer;
		else if (m.KATAKANA.has(t)) switch (this.mode) {
			case "MACRO0": return this.mode = "MACRO1", Uint8Array.from([
				i.SS3,
				97,
				i.ESC,
				a.LS1R,
				...m.KATAKANA.get(t).map((e) => e | 128)
			]).buffer;
			case "MACRO1": return Uint8Array.from([...m.KATAKANA.get(t).map((e) => e | 128)]).buffer;
			default: throw new e(this.mode, "Unexpected mode in ARIBB24JapaneseJIS8Encoder");
		}
		else if (m.KANJI.has(t)) return Uint8Array.from(m.KANJI.get(t)).buffer;
		else throw new n("Unsupported Character in JIS8 Encoder");
	}
	encodeDRCS(e) {
		let t = r(e.binary);
		if (!this.drcs_md5_to_code.has(t)) {
			if (this.current_drcs_code[0] === 127 && this.current_drcs_code[1] === 127) return Uint8Array.from(m.KANJI.get("〓")).buffer;
			let n = Uint8Array.from([
				1,
				this.current_drcs_code[0],
				this.current_drcs_code[1],
				1,
				0,
				2 ** e.depth - 2,
				e.width,
				e.height
			]).buffer;
			this.drcs_units.push(o.from(new Uint8Array(l(n, e.binary)), 2)), this.drcs_md5_to_code.set(t, structuredClone(this.current_drcs_code)), this.current_drcs_code[1]++, this.current_drcs_code[1] > 127 && (this.current_drcs_code[0]++, this.current_drcs_code[1] = 33);
		}
		return this.mode = "MACRO0", Uint8Array.from([
			i.ESC,
			36,
			41,
			32,
			64,
			...this.drcs_md5_to_code.get(t).map((e) => e | 128),
			i.SS3,
			96,
			i.ESC,
			a.LS1R
		]).buffer;
	}
	encodeBitmap(e) {
		throw new t("Bitmap is Not Implemented");
	}
	encodeMosaic(e) {
		throw new t("Mozaic Character is Not Implemented");
	}
};
//#endregion
export { m as default };
