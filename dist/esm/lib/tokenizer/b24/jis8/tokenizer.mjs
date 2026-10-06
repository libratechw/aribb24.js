import { ARIBB24CharacterToken as e, ARIBB24DRCSToken as t } from "../../token.mjs";
import { ExhaustivenessError as n, UnreachableError as r } from "../../../../util/error.mjs";
import { ByteStream as i } from "../../../../util/bytestream.mjs";
import a, { CONTROL_CODES as o, processC0 as s, processC1 as c } from "../tokenizer.mjs";
//#region src/lib/tokenizer/b24/jis8/tokenizer.ts
var l = {
	LS2: 110,
	LS3: 111,
	LS1R: 126,
	LS2R: 125,
	LS3R: 124
}, u = class extends a {
	GL;
	GR;
	GB;
	character_dicts;
	drcs_dicts;
	non_spacing;
	constructor(e, t, n, r, i, a) {
		super(), this.GL = e, this.GR = t, this.GB = n, this.character_dicts = r, this.drcs_dicts = structuredClone(i), this.non_spacing = a;
	}
	tokenizeStatement(a) {
		let u = new i(a), d = [];
		for (; !u.isEmpty();) {
			if (32 < u.peekU8() && u.peekU8() < 127) {
				let r = 0;
				for (let e = 0; e < this.GB[this.GL].bytes; e++) r <<= 8, r |= u.readU8() & 127;
				let { type: i, dict: a } = this.GB[this.GL];
				switch (i) {
					case "Character":
						if (a.has(r)) {
							let t = a.get(r), n = this.non_spacing.has(t);
							d.push(e.from(t, n));
						}
						break;
					case "DRCS":
						if (a.has(r)) {
							let { width: e, height: n, depth: i, binary: o } = a.get(r);
							d.push(t.from(e, n, i, o));
						}
						break;
					case "MACRO":
						a.has(r) && d.push(...this.tokenizeStatement(a.get(r)));
						break;
					default: throw new n(i, "Undefined Dict Type in STD-B24 ARIB Caption");
				}
				continue;
			} else if (160 < u.peekU8() && u.peekU8() < 255) {
				let r = 0;
				for (let e = 0; e < this.GB[this.GR].bytes; e++) r <<= 8, r |= u.readU8() & 127;
				let { type: i, dict: a } = this.GB[this.GR];
				switch (i) {
					case "Character":
						if (a.has(r)) {
							let t = a.get(r), n = this.non_spacing.has(t);
							d.push(e.from(t, n));
						}
						break;
					case "DRCS":
						if (a.has(r)) {
							let { width: e, height: n, depth: i, binary: o } = a.get(r);
							d.push(t.from(e, n, i, o));
						}
						break;
					case "MACRO":
						a.has(r) && d.push(...this.tokenizeStatement(a.get(r)));
						break;
					default: throw new n(i, "Undefined Dict Type in STD-B24 ARIB Caption");
				}
				continue;
			}
			let i = u.peekU8();
			switch (i) {
				case o.LS1:
					u.readU8(), this.GL = 1;
					break;
				case o.LS0:
					u.readU8(), this.GL = 0;
					break;
				case o.SS2: {
					u.readU8();
					let r = 0;
					for (let e = 0; e < this.GB[2].bytes; e++) r <<= 8, r |= u.readU8() & 127;
					let { type: i, dict: a } = this.GB[2];
					switch (i) {
						case "Character":
							if (a.has(r)) {
								let t = a.get(r), n = this.non_spacing.has(t);
								d.push(e.from(t, n));
							}
							break;
						case "DRCS":
							if (a.has(r)) {
								let { width: e, height: n, depth: i, binary: o } = a.get(r);
								d.push(t.from(e, n, i, o));
							}
							break;
						case "MACRO":
							a.has(r) && d.push(...this.tokenizeStatement(a.get(r)));
							break;
						default: throw new n(i, "Undefined Dict Type in STD-B24 ARIB Caption");
					}
					break;
				}
				case o.ESC: {
					u.readU8();
					let e = u.readU8();
					switch (e) {
						case l.LS2:
							this.GL = 2;
							break;
						case l.LS3:
							this.GL = 3;
							break;
						case l.LS1R:
							this.GR = 1;
							break;
						case l.LS2R:
							this.GR = 2;
							break;
						case l.LS3R:
							this.GR = 3;
							break;
						case 36: {
							let e = u.readU8();
							if (40 <= e && e <= 43) {
								let t = u.readU8();
								if (t === 32) {
									let t = u.readU8();
									this.GB[e - 40] = Object.values(this.drcs_dicts).find(({ code: e }) => e === t);
								} else this.GB[e - 40] = Object.values(this.character_dicts).find(({ code: e }) => e === t);
							} else this.GB[0] = Object.values(this.character_dicts).find(({ code: t }) => t === e);
							break;
						}
						default:
							if (40 <= e && e <= 43) {
								let t = u.readU8();
								if (t === 32) {
									let t = u.readU8();
									this.GB[e - 40] = Object.values(this.drcs_dicts).find(({ code: e }) => e === t);
								} else this.GB[e - 40] = Object.values(this.character_dicts).find(({ code: e }) => e === t);
							} else throw Error(`Undefined ESC Code in STD-B24 ARIB Caption (0x${e.toString(16)})`);
							break;
					}
					break;
				}
				case o.SS3: {
					u.readU8();
					let r = 0;
					for (let e = 0; e < this.GB[3].bytes; e++) r <<= 8, r |= u.readU8() & 127;
					let { type: i, dict: a } = this.GB[3];
					switch (i) {
						case "Character":
							if (a.has(r)) {
								let t = a.get(r), n = this.non_spacing.has(t);
								d.push(e.from(t, n));
							}
							break;
						case "DRCS":
							if (a.has(r)) {
								let { width: e, height: n, depth: i, binary: o } = a.get(r);
								d.push(t.from(e, n, i, o));
							}
							break;
						case "MACRO":
							a.has(r) && d.push(...this.tokenizeStatement(a.get(r)));
							break;
						default: throw new n(i, "Undefined Dict Type in STD-B24 ARIB Caption");
					}
					break;
				}
				default: if (0 <= i && i <= 32 || i === o.DEL) d.push(s(u));
				else if (128 <= i && i <= 159) d.push(c(u));
				else throw new r("Undefined Conrtol Code in STD-B24 ARIB Caption");
			}
		}
		return d;
	}
	processDRCS(e, n) {
		let r = 0, i = n.byteLength;
		for (n[r + 0], r += 1; r < i;) {
			let i = n[r + 0] << 8 | n[r + 1], a = n[r + 2];
			r += 3;
			for (let o = 0; o < a; o++) {
				(n[r + 0] & 240) >> 4;
				let a = n[r + 0] & 15;
				if (a === 0 || a === 1) {
					let a = n[r + 1] + 2, o = n[r + 2], s = n[r + 3], c = [
						0,
						1,
						6,
						2,
						7,
						5,
						4,
						3
					][a * 29 >> 5], l = Math.floor(o * s * c / 8), u = n.slice(r + 4, r + 4 + l).buffer;
					if (e === 1) {
						let e = (i & 65280) >> 8, n = i & 127, r = Object.values(this.drcs_dicts).find((t) => t.code === e);
						if (r == null || r.type !== "DRCS") continue;
						r.dict.set(n, t.from(o, s, c, u));
					} else {
						let e = i & 32639, n = Object.values(this.drcs_dicts).find((e) => e.code === 64);
						if (n == null || n.type !== "DRCS") continue;
						n.dict.set(e, t.from(o, s, c, u));
					}
					r += 4 + l;
				} else return;
			}
		}
	}
};
//#endregion
export { l as ESC_CODES, u as default };
