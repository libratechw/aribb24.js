import { ARIBB24ActiveCoordinatePositionSetToken as e, ARIBB24ActivePositionBackwardToken as t, ARIBB24ActivePositionDownToken as n, ARIBB24ActivePositionForwardToken as r, ARIBB24ActivePositionReturnToken as i, ARIBB24ActivePositionSetToken as a, ARIBB24ActivePositionUpToken as ee, ARIBB24BellToken as te, ARIBB24BitmapToken as ne, ARIBB24BlackForegroundToken as re, ARIBB24BlueForegroundToken as o, ARIBB24BuiltinSoundReplayToken as s, ARIBB24CancelToken as c, ARIBB24CharacterCompositionDotDesignationToken as l, ARIBB24CharacterSizeControlToken as u, ARIBB24CharacterToken as d, ARIBB24ClearScreenToken as f, ARIBB24ColorControlBackgroundToken as p, ARIBB24ColorControlForegroundToken as m, ARIBB24ColorControlHalfBackgroundToken as h, ARIBB24ColorControlHalfForegroundToken as g, ARIBB24ConcealmentModeToken as _, ARIBB24ConcealmentModeType as v, ARIBB24CyanForegroundToken as y, ARIBB24DeleteToken as b, ARIBB24FlashingControlToken as x, ARIBB24GreenForegroundToken as S, ARIBB24HilightingCharacterBlockToken as C, ARIBB24MagentaForegroundToken as w, ARIBB24MiddleSizeToken as T, ARIBB24NormalSizeToken as E, ARIBB24NullToken as D, ARIBB24OrnamentControlHemmingToken as O, ARIBB24OrnamentControlHollowToken as k, ARIBB24OrnamentControlNoneToken as A, ARIBB24OrnamentControlShadeToken as j, ARIBB24OrnamentControlType as M, ARIBB24PalletControlToken as N, ARIBB24ParameterizedActivePositionForwardToken as P, ARIBB24PatternPolarityControlToken as F, ARIBB24RasterColourCommandToken as ie, ARIBB24RecordSeparatorToken as I, ARIBB24RedForegroundToken as L, ARIBB24RepeatCharacterToken as R, ARIBB24ReplacingConcealmentModeToken as z, ARIBB24SetDisplayFormatToken as B, ARIBB24SetDisplayPositionToken as V, ARIBB24SetHorizontalSpacingToken as H, ARIBB24SetVerticalSpacingToken as U, ARIBB24SetWritingFormatToken as W, ARIBB24SingleConcealmentModeToken as G, ARIBB24SingleConcealmentModeType as K, ARIBB24SmallSizeToken as q, ARIBB24SpaceToken as J, ARIBB24StartLiningToken as Y, ARIBB24StopLiningToken as ae, ARIBB24TimeControlModeToken as oe, ARIBB24TimeControlWaitToken as se, ARIBB24UnitSeparatorToken as ce, ARIBB24WhiteForegroundToken as le, ARIBB24WritingModeModificationToken as ue, ARIBB24YellowForegroundToken as de } from "../token.mjs";
import { ExhaustivenessError as fe, NotImplementedError as X, NotUsedDueToStandardError as pe, UnreachableError as Z } from "../../../util/error.mjs";
import me from "../../../util/md5.mjs";
//#region src/lib/tokenizer/b24/tokenizer.ts
var Q = {
	NUL: 0,
	BEL: 7,
	APB: 8,
	APF: 9,
	APD: 10,
	APU: 11,
	CS: 12,
	APR: 13,
	LS1: 14,
	LS0: 15,
	PAPF: 22,
	CAN: 24,
	SS2: 25,
	ESC: 27,
	APS: 28,
	SS3: 29,
	RS: 30,
	US: 31,
	SP: 32,
	DEL: 127,
	BKF: 128,
	RDF: 129,
	GRF: 130,
	YLF: 131,
	BLF: 132,
	MGF: 133,
	CNF: 134,
	WHF: 135,
	SSZ: 136,
	MSZ: 137,
	NSZ: 138,
	SZX: 139,
	COL: 144,
	FLC: 145,
	CDC: 146,
	POL: 147,
	WMM: 148,
	MACRO: 149,
	HLC: 151,
	RPC: 152,
	SPL: 153,
	STL: 154,
	CSI: 155,
	TIME: 157
}, $ = {
	GSM: 66,
	SWF: 83,
	CCC: 84,
	SDF: 86,
	SSM: 87,
	SHS: 88,
	SVS: 89,
	PLD: 91,
	PLU: 92,
	GAA: 93,
	SRC: 94,
	SDP: 95,
	ACPS: 97,
	TCC: 98,
	ORN: 99,
	MDF: 100,
	CFS: 101,
	XCS: 102,
	SCR: 103,
	PRA: 104,
	ACS: 105,
	UED: 106,
	RCS: 110,
	SCS: 111
}, he = (e) => {
	switch (e.readU8()) {
		case Q.NUL: return D.from();
		case Q.BEL: return te.from();
		case Q.APB: return t.from();
		case Q.APF: return r.from();
		case Q.APD: return n.from();
		case Q.APU: return ee.from();
		case Q.CS: return f.from();
		case Q.APR: return i.from();
		case Q.PAPF: return P.from(e.readU8() & 63);
		case Q.CAN: return c.from();
		case Q.APS: {
			let t = e.readU8() & 63, n = e.readU8() & 63;
			return a.from(n, t);
		}
		case Q.RS: return I.from();
		case Q.US: return ce.from();
		case Q.SP: return J.from();
		case Q.DEL: return b.from();
		default: throw new Z("Undefined C0 detected");
	}
}, ge = (t) => {
	switch (t.readU8()) {
		case Q.BKF: return re.from();
		case Q.RDF: return L.from();
		case Q.GRF: return S.from();
		case Q.YLF: return de.from();
		case Q.BLF: return o.from();
		case Q.MGF: return w.from();
		case Q.CNF: return y.from();
		case Q.WHF: return le.from();
		case Q.SSZ: return q.from();
		case Q.MSZ: return T.from();
		case Q.NSZ: return E.from();
		case Q.SZX: {
			let e = t.readU8();
			switch (e) {
				case 96:
				case 65:
				case 68:
				case 69:
				case 107:
				case 100: return u.from(e);
			}
			throw new Z("Undefined SZX");
		}
		case Q.COL: {
			let e = t.readU8(), n = e & 15;
			switch (e & 112) {
				case 32: return N.from(t.readU8() & 15);
				case 64: return m.from(n);
				case 80: return p.from(n);
				case 96: return g.from(n);
				case 112: return h.from(n);
			}
			throw new Z("Undefined COL");
		}
		case Q.FLC: {
			let e = t.readU8();
			switch (e) {
				case 64:
				case 71:
				case 79: return x.from(e);
			}
			throw new Z("Undefined FLC");
		}
		case Q.CDC: {
			let e = t.readU8();
			if (e === 32) {
				let e = t.readU8();
				switch (e) {
					case 64:
					case 65:
					case 66:
					case 67:
					case 68:
					case 69:
					case 70:
					case 71:
					case 72:
					case 73:
					case 74: return z.from(e);
				}
			} else if (e === K.START) return G.from(e);
			else if (e === v.STOP) return _.from(e);
			throw new Z("Undefined CDC");
		}
		case Q.POL: {
			let e = t.readU8();
			switch (e) {
				case 64:
				case 65:
				case 66: return F.from(e);
			}
			throw new Z("Undefined POL");
		}
		case Q.WMM: {
			let e = t.readU8();
			switch (e) {
				case 64:
				case 68:
				case 69: return ue.from(e);
			}
			throw new Z("Undefined WMM");
		}
		case Q.MACRO: throw new X("MACRO is Not Implemeted!");
		case Q.HLC: {
			let e = t.readU8() & 15;
			return C.from(e);
		}
		case Q.RPC: {
			let e = t.readU8() & 63;
			return R.from(e);
		}
		case Q.SPL: return ae.from();
		case Q.STL: return Y.from();
		case Q.CSI: {
			let n = [0], r = 0;
			for (; !t.isEmpty();) {
				let e = t.readU8();
				if (e === 32 || e == 59) {
					n.push(0);
					continue;
				} else if (e & 64) {
					r = e;
					break;
				}
				n[n.length - 1] *= 10, n[n.length - 1] += e & 15;
			}
			switch (r) {
				case $.GSM: throw new X("GSM is Not Implemented!");
				case $.SWF: return W.from(n[0]);
				case $.CCC: throw new X("CCC is Not Implemented!");
				case $.SDF: return B.from(n[0], n[1]);
				case $.SSM: return l.from(n[0], n[1]);
				case $.SHS: return H.from(n[0]);
				case $.SVS: return U.from(n[0]);
				case $.PLD: throw new X("PLD is Not Implemented!");
				case $.PLU: throw new X("PLU is Not Implemented!");
				case $.GAA: throw new X("GAA is Not Implemented!");
				case $.SRC: throw new X("SRC is Not Implemented!");
				case $.SDP: return V.from(n[0], n[1]);
				case $.ACPS: return e.from(n[0], n[1]);
				case $.TCC: throw new X("TCC is Not Implemented!");
				case $.ORN:
					switch (n[0]) {
						case M.NONE: return A.from();
						case M.HEMMING: return O.from(n[1]);
						case M.SHADE: return j.from(n[1]);
						case M.HOLLOW: return k.from();
					}
					throw new Z("Undefined ORN");
				case $.MDF: throw new X("MDF is Not Implemented!");
				case $.CFS: throw new X("CFS is Not Implemented!");
				case $.XCS: throw new X("XCS is Not Implemented!");
				case $.SCR: throw new X("SCR is Not Implemented!");
				case $.PRA: return s.from(n[0]);
				case $.ACS: throw new X("ACS is Not Implemented!");
				case $.UED: throw new X("UED is Not Implemented!");
				case $.RCS: return ie.from(n[0]);
				case $.SCS: throw new X("SCS is Not Implemented!");
				default: throw new Z(`Unhandled CSI Code in STD-B24 ARIB Caption (0x${r.toString(16)})`);
			}
		}
		case Q.TIME: switch (t.readU8()) {
			case 32: {
				let e = (t.readU8() & 63) / 10;
				return se.from(e);
			}
			case 40: {
				let e = t.readU8();
				switch (e) {
					case 64:
					case 65:
					case 66:
					case 67: return oe.from(e);
				}
				throw new Z("Undefined TIME");
			}
			case 41: throw new pe("TIME 0x29 (Specify Time) is Not Used by Specification");
			default: throw new Z("Undefined TIME");
		}
		default: throw new Z("Undefined C1/CSI");
	}
}, _e = class {
	tokenize(e) {
		return this.tokenizeDataUnits(e.units);
	}
	tokenizeDataUnits(e) {
		let t = [];
		for (let n of e) switch (n.tag) {
			case "Statement":
				t.push(...this.tokenizeStatement(n.data));
				break;
			case "DRCS":
				this.processDRCS(n.bytes, n.data);
				break;
			case "Bitmap":
				t.push(...this.tokenizeBitmap(n.data));
				break;
			default: throw new fe(n, "Unexpected DataUnit in STD-B24 ARIB Caption");
		}
		return t;
	}
	tokenizeBitmap(e) {
		let t = 0, n = (e[t] << 8 | e[t + 1]) << 16 >> 16;
		t += 2;
		let r = (e[t] << 8 | e[t + 1]) << 16 >> 16;
		t += 2;
		let i = e[t];
		t += 1;
		let a = Array.from(e.subarray(t, t + i));
		return t += i, t + 33 > e.byteLength ? [] : [ne.from(n, r, a, e.slice(t).buffer)];
	}
}, ve = (e, t) => e.map((e) => {
	if (e.tag !== "DRCS") return e;
	let n = me(e.binary), r = t.get(n) ?? t.get(n.toUpperCase());
	return r === void 0 ? e : d.from(r + e.combining);
});
//#endregion
export { Q as CONTROL_CODES, $ as CSI_CODE, _e as default, he as processC0, ge as processC1, ve as replaceDRCS };
