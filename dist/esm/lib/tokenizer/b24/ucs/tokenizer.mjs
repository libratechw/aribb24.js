import { ARIBB24CharacterToken as e, ARIBB24DRCSToken as t } from "../../token.mjs";
import { NotImplementedError as n, NotUsedDueToStandardError as r, UnreachableError as i } from "../../../../util/error.mjs";
import { ByteStream as a } from "../../../../util/bytestream.mjs";
import o, { CONTROL_CODES as s, processC0 as c, processC1 as l } from "../tokenizer.mjs";
//#region src/lib/tokenizer/b24/ucs/tokenizer.ts
var u = { from(e, t, n, r) {
	return {
		width: e,
		height: t,
		depth: n,
		binary: r
	};
} }, d = (e) => {
	if (e.exists(1)) {
		let t = e.peekU8();
		if (0 <= t && t <= 32 || t == 127) return !0;
	}
	if (e.exists(2)) {
		let t = e.peekU16();
		if (49792 <= t && t <= 49823) return !0;
	}
	return !1;
}, f = class extends o {
	segmenter = new Intl.Segmenter(void 0, { granularity: "grapheme" });
	decoder = new TextDecoder("utf-8", { fatal: !0 });
	drcs = /* @__PURE__ */ new Map();
	tokenizeStatement(o) {
		let u = new a(o), f = [];
		for (; !u.isEmpty();) {
			if (!d(u)) {
				let n = [];
				for (; !u.isEmpty() && !d(u);) n.push(u.readU8());
				for (let r of Array.from(this.segmenter.segment(this.decoder.decode(Uint8Array.from(n))), ({ segment: e }) => e)) {
					let [n, ...i] = Array.from(r);
					if (this.drcs.has(n)) {
						let { width: e, height: r, depth: a, binary: o } = this.drcs.get(n);
						f.push(t.from(e, r, a, o, i.join("")));
					} else f.push(e.from(r));
				}
				continue;
			}
			let a = u.peekU8();
			if (u.exists(1) && 0 <= a && a <= 32 || a === s.DEL) {
				switch (a) {
					case s.LS0:
					case s.LS1:
					case s.SS2:
					case s.SS3: throw new r("Single/Locking Shift is Not used in UTF-8");
					case s.ESC: throw new n("ESC in UTF-8 is Not Implemented");
				}
				f.push(c(u));
			} else if (u.exists(2) && 49792 <= u.peekU16() && u.peekU16() <= 49823) u.readU8(), f.push(l(u));
			else throw new i("Undefined Conrtol Code in STD-B24 ARIB Caption");
		}
		return f;
	}
	processDRCS(e, t) {
		if (e === 1) throw new r("Not used 1-byte DRCS in UTF-8");
		let n = 0, i = t.byteLength;
		for (t[n + 0], n += 1; n < i;) {
			let e = t[n + 0] << 8 | t[n + 1], r = t[n + 2];
			n += 3;
			for (let i = 0; i < r; i++) {
				(t[n + 0] & 240) >> 4;
				let r = t[n + 0] & 15;
				if (r === 0 || r === 1) {
					let r = t[n + 1] + 2, i = t[n + 2], a = t[n + 3], o = [
						0,
						1,
						6,
						2,
						7,
						5,
						4,
						3
					][r * 29 >> 5], s = Math.floor(i * a * o / 8), c = t.slice(n + 4, n + 4 + s).buffer;
					this.drcs.set(String.fromCodePoint(e), u.from(i, a, o, c)), n += 4 + s;
				} else return;
			}
		}
	}
};
//#endregion
export { f as default };
