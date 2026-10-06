import { ViolationStandardError as e } from "../../../util/error.mjs";
import { ByteStream as t } from "../../../util/bytestream.mjs";
import { timecodeToSecond as n } from "../../../util/timecode.mjs";
import ee from "./datagroup.mjs";
//#region src/lib/demuxer/b36/index.ts
var r = {
	TIME: "T",
	FRAME: "F"
}, i = {
	FREE: "FR",
	REALTIME: "RT",
	OFFSETTIME: "OF"
}, a = {
	PROGRAM: "0",
	CM: "1",
	CONTENTS: "2",
	SOUND: "3"
}, o = {
	NEW: "N",
	RENEW: "R",
	ADDITION: "A",
	NOT_SPECIFIED: " "
}, s = {
	AUTO_ENABLED: "0",
	AUTO_DISABLED: "1",
	SELECT: "2",
	SELECT_SPECIFIC: "3"
}, c = {
	INDEPENDENT: " ",
	COMPLEMENT: "T",
	CAPTION: "C"
}, l = {
	CONTINUOUS_TIMECODE: "TC",
	UNCONTINUOUS_TIMECODE: "TU",
	LAPTIME: "LT",
	JST: "JS"
}, u = {
	ASYNC: "A",
	PROGRAM_SYNC: "P",
	TIME_SYNC: "T"
}, d = {
	CONTENTS_AND_CM: "0",
	CONTENTS: "1",
	CM: "2",
	SOUND: "3"
}, f = {
	REALTIME: "RT",
	DURATIONTIME: "DT",
	UNTIME: "UT",
	NOT_SPECIFIED: "  "
}, p = {
	STANDARD: "ST",
	DOUBLE: "DB",
	EUROPEAN: "EL",
	FULLHI: "H2",
	HI: "H1",
	HD: "HD",
	SD: "SD",
	MOBILE: "MB"
}, te = {
	HORIZONTAL: "H",
	VERTICAL: "V"
}, ne = {
	HD: " ",
	SD: "*"
}, re = {
	FIXED: "F",
	SCROLL: "S",
	ROLLUP: "R"
}, ie = {
	HORIZONTAL: "H",
	VERTICAL: "V"
}, m = (m) => {
	m = m instanceof Uint8Array ? m : new Uint8Array(m);
	let h = new TextDecoder("shift-jis", { fatal: !0 }), g = new t(m), _ = h.decode(g.read(8));
	if (!(_ === "DCAPTION" || _ === "BCAPTION" || _ === "MCAPTION")) throw new e(`Undefined CaptionDataLabel: ${_}`);
	g.read(248);
	let v = g.readU32(), y = new t(g.read(Math.floor((4 + v + 255) / 256) * 256 - 4)), b = h.decode(y.read(6)).trim(), ae = h.decode(y.read(27)).trim(), oe = h.decode(y.read(40)).trim(), se = h.decode(y.read(40)).trim(), x = String.fromCharCode(y.readU8());
	switch (x) {
		case a.PROGRAM:
		case a.CM:
		case a.CONTENTS:
		case a.SOUND: break;
		default: throw new e(`Undefined programMaterialType: ${x}`);
	}
	let S = String.fromCharCode(y.readU8());
	switch (S) {
		case o.NEW:
		case o.RENEW:
		case o.ADDITION:
		case o.NOT_SPECIFIED: break;
		default: throw new e(`Undefined registrationMode: ${S}`);
	}
	let C = h.decode(y.read(3)), w = String.fromCharCode(y.readU8());
	switch (w) {
		case s.AUTO_ENABLED:
		case s.AUTO_DISABLED:
		case s.SELECT:
		case s.SELECT_SPECIFIC: break;
		default: throw new e(`Undefined displayMode: ${w}`);
	}
	let T = String.fromCharCode(y.readU8());
	switch (T) {
		case s.AUTO_ENABLED:
		case s.AUTO_DISABLED:
		case s.SELECT:
		case s.SELECT_SPECIFIC: break;
		default: throw new e(`Undefined displayMode: ${T}`);
	}
	let ce = `${w}${T}`, E = String.fromCharCode(y.readU8());
	switch (E) {
		case c.INDEPENDENT:
		case c.COMPLEMENT:
		case c.CAPTION: break;
		default: throw new e(`Undefined programType: ${E}`);
	}
	let D = String.fromCharCode(y.readU8());
	if (D !== "*" && D !== " ") throw new e(`Undefined sound: ${D}`);
	let O = D === "*", le = Number.parseInt(String.fromCharCode(y.readU8(), y.readU8(), y.readU8(), y.readU8()), 10), k = Number.parseInt(String.fromCharCode(y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8()), 10), A = String.fromCharCode(y.readU8());
	if (A !== "*" && A !== " ") throw new e(`Undefined untime: ${A}`);
	let ue = A === "*", j = String.fromCharCode(y.readU8(), y.readU8());
	switch (j) {
		case l.CONTINUOUS_TIMECODE:
		case l.UNCONTINUOUS_TIMECODE:
		case l.LAPTIME:
		case l.JST: break;
		default: throw new e(`Undefined realtimeTimingType: ${j}`);
	}
	let M = String.fromCharCode(y.readU8());
	switch (M) {
		case r.TIME:
		case r.FRAME: break;
		default: throw new e(`Undefined TimingUnitType: ${M}`);
	}
	let N = String.fromCharCode(y.readU8(), y.readU8()), P = String.fromCharCode(y.readU8(), y.readU8()), F = String.fromCharCode(y.readU8(), y.readU8()), de = String.fromCharCode(y.readU8(), y.readU8());
	y.readU8();
	let I = M === "F" ? n(`${N}:${P}:${F};${de}`) : (Number.parseInt(N, 10) * 60 + Number.parseInt(P, 10)) * 60 + Number.parseInt(F, 10) + Number.parseInt(de, 10) / 100, L = String.fromCharCode(y.readU8());
	switch (L) {
		case u.ASYNC:
		case u.PROGRAM_SYNC:
		case u.TIME_SYNC: break;
		default: throw new e(`Undefined syncronizationMode: ${L}`);
	}
	let R = String.fromCharCode(y.readU8(), y.readU8());
	switch (R) {
		case i.FREE:
		case i.REALTIME:
		case i.OFFSETTIME: break;
		default: throw new e(`Undefined timeControlMode: ${R}`);
	}
	let z = String.fromCharCode(y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8());
	if (/[^* ]/.test(z)) throw new e(`Undefined extensible: ${z}`);
	let fe = [
		z[0] === "*",
		z[1] === "*",
		z[2] === "*",
		z[3] === "*",
		z[4] === "*",
		z[5] === "*",
		z[6] === "*",
		z[7] === "*"
	], B = String.fromCharCode(y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8());
	if (/[^* ]/.test(B)) throw new e(`Undefined extensible: ${B}`);
	let pe = [
		B[0] === "*",
		B[1] === "*",
		B[2] === "*",
		B[3] === "*",
		B[4] === "*",
		B[5] === "*",
		B[6] === "*",
		B[7] === "*"
	], V = String.fromCharCode(y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8()), H = V === "        " ? null : [
		Number.parseInt(V.slice(0, 4), 10),
		Number.parseInt(V.slice(4, 6), 10),
		Number.parseInt(V.slice(6, 8), 10)
	], me = h.decode(y.read(20)).trim(), U = String.fromCharCode(y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8()), W = U === "            " ? null : [
		Number.parseInt(U.slice(0, 4), 10),
		Number.parseInt(U.slice(4, 6), 10),
		Number.parseInt(U.slice(6, 8), 10),
		Number.parseInt(U.slice(8, 10), 10),
		Number.parseInt(U.slice(10, 12), 10)
	], G = String.fromCharCode(y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8()), he = G === "        " ? null : [
		Number.parseInt(G.slice(0, 4), 10),
		Number.parseInt(G.slice(4, 6), 10),
		Number.parseInt(G.slice(6, 8), 10)
	], K = String.fromCharCode(y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8()), q = K === "        " ? null : [
		Number.parseInt(K.slice(0, 4), 10),
		Number.parseInt(K.slice(4, 6), 10),
		Number.parseInt(K.slice(6, 8), 10)
	], J = String.fromCharCode(y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8());
	if (/[^* ]/.test(J)) throw new e(`Undefined broadcastDaysOfWeek: ${J}`);
	let Y = [
		J[0] === "*",
		J[1] === "*",
		J[2] === "*",
		J[3] === "*",
		J[4] === "*",
		J[5] === "*",
		J[6] === "*"
	], X = String.fromCharCode(y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8()), ge = X === "      " ? null : [
		Number.parseInt(X.slice(0, 2), 10),
		Number.parseInt(X.slice(2, 4), 10),
		Number.parseInt(X.slice(4, 6), 10)
	], Z = String.fromCharCode(y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8(), y.readU8()), _e = Z === "      " ? null : [
		Number.parseInt(Z.slice(0, 2), 10),
		Number.parseInt(Z.slice(2, 4), 10),
		Number.parseInt(Z.slice(4, 6), 10)
	], ve = h.decode(y.read(60)).trim();
	y.read(45);
	let Q = String.fromCharCode(y.readU8());
	if (Q !== "*" && Q !== " ") throw new e(`Undefined completed: ${Q}`);
	let ye = Q === "*", $ = String.fromCharCode(y.readU8());
	if ($ !== "*" && $ !== " ") throw new e(`Undefined usersAreaUsed: ${$}`);
	let be = $ === "*", xe = be ? {
		usersAreaUsed: be,
		writingFormatConversionMode: y.readU8(),
		drcsConversionMode: (y.readU8() & 192) >> 6
	} : { usersAreaUsed: be }, Se = [];
	for (; !g.isEmpty();) {
		let a = g.readU32(), o = g.read(Math.floor((4 + a + 255) / 256) * 256 - 4), s = new DataView(o.buffer, o.byteOffset, 4 + a), c = 0;
		if (s.byteLength < c + 1 + 2) continue;
		let l = s.getUint16(c + 1, !1);
		if (c += 3, s.byteLength < c + l) continue;
		let u = new t(o.subarray(c, c + l)), m = String.fromCharCode(u.readU8(), u.readU8(), u.readU8(), u.readU8(), u.readU8(), u.readU8()), _ = String.fromCharCode(u.readU8());
		switch (_) {
			case d.CONTENTS_AND_CM:
			case d.CONTENTS:
			case d.CM:
			case d.SOUND: break;
			default: throw new e(`Undefined PageMaterialType: ${_}`);
		}
		let v = String.fromCharCode(u.readU8(), u.readU8());
		switch (v) {
			case f.REALTIME:
			case f.DURATIONTIME:
			case f.UNTIME:
			case f.NOT_SPECIFIED: break;
			default: throw new e(`Undefined DisplayTimingType: ${v}`);
		}
		let y = String.fromCharCode(u.readU8());
		switch (y) {
			case r.TIME:
			case r.FRAME: break;
			default: throw new e(`Undefined TimingUnitType: ${y}`);
		}
		let b = String.fromCharCode(u.readU8(), u.readU8()), ae = String.fromCharCode(u.readU8(), u.readU8()), oe = String.fromCharCode(u.readU8(), u.readU8()), se = String.fromCharCode(u.readU8(), u.readU8());
		u.readU8();
		let x = y === "F" ? n(`${b}:${ae}:${oe};${se}`) : (Number.parseInt(b, 10) * 60 + Number.parseInt(ae, 10)) * 60 + Number.parseInt(oe, 10) + Number.parseInt(se, 10) / 100, S = String.fromCharCode(u.readU8(), u.readU8()), C = String.fromCharCode(u.readU8(), u.readU8()), w = String.fromCharCode(u.readU8(), u.readU8()), T = String.fromCharCode(u.readU8(), u.readU8()), ce = `${S}${C}${w}${T}`;
		u.readU8();
		let E = ce === "        " ? Infinity : y === "F" ? n(`${S}:${C}:${w};${T}`) : (Number.parseInt(S, 10) * 60 + Number.parseInt(C, 10)) * 60 + Number.parseInt(w, 10) + Number.parseInt(T, 10) / 100, D = String.fromCharCode(u.readU8(), u.readU8());
		switch (D) {
			case i.FREE:
			case i.REALTIME:
			case i.OFFSETTIME: break;
			default: throw new e(`Undefined timeControlMode: ${D}`);
		}
		let O = String.fromCharCode(u.readU8(), u.readU8(), u.readU8());
		if (O !== "OFF" && O !== "   ") throw new e(`Undefined clearScreen: ${O}`);
		let le = O === "OFF", k = String.fromCharCode(u.readU8(), u.readU8());
		switch (k) {
			case p.STANDARD:
			case p.DOUBLE:
			case p.EUROPEAN:
			case p.FULLHI:
			case p.HI:
			case p.HD:
			case p.SD:
			case p.MOBILE: break;
			default: throw new e(`Undefined formatDensity: ${k}`);
		}
		let A = String.fromCharCode(u.readU8());
		switch (A) {
			case te.HORIZONTAL:
			case te.VERTICAL: break;
			default: throw new e(`Undefined formatWritingMode: ${A}`);
		}
		let ue = `${k}${A}`, j = String.fromCharCode(u.readU8());
		switch (j) {
			case ne.HD:
			case ne.SD: break;
			default: throw new e(`Undefined displayAspectRatio: ${j}`);
		}
		let M = String.fromCharCode(u.readU8(), u.readU8(), u.readU8(), u.readU8()), N = String.fromCharCode(u.readU8(), u.readU8(), u.readU8(), u.readU8()), P = String.fromCharCode(u.readU8(), u.readU8(), u.readU8(), u.readU8()), F = String.fromCharCode(u.readU8(), u.readU8(), u.readU8(), u.readU8()), de = M !== "    " && N !== "    " && P !== "    " && F !== "    " ? [[Number.parseInt(M, 10), Number.parseInt(N, 10)], [Number.parseInt(P, 10), Number.parseInt(F, 10)]] : null, I = String.fromCharCode(u.readU8());
		switch (I) {
			case re.FIXED:
			case re.SCROLL:
			case re.ROLLUP: break;
			default: throw new e(`Undefined scrollType: ${I}`);
		}
		let L = String.fromCharCode(u.readU8());
		switch (L) {
			case ie.HORIZONTAL:
			case ie.VERTICAL: break;
			default: throw new e(`Undefined scrollDirectionType: ${L}`);
		}
		let R = String.fromCharCode(u.readU8());
		if (R !== "*" && R !== " ") throw new e(`Undefined sound: ${R}`);
		let z = R === "*", fe = Number.parseInt(String.fromCharCode(u.readU8(), u.readU8(), u.readU8(), u.readU8(), u.readU8()), 10), B = String.fromCharCode(u.readU8(), u.readU8(), u.readU8());
		if (B !== "ERS" && B !== "   ") throw new e(`Undefined deleted: ${B}`);
		let pe = B === "ERS", V = h.decode(u.read(20)).trim();
		u.read(32);
		let H = String.fromCharCode(u.readU8());
		if (H !== "*" && H !== " ") throw new e(`Undefined completed: ${H}`);
		let me = H === "*", U = String.fromCharCode(u.readU8());
		if (U !== "*" && U !== " ") throw new e(`Undefined sound: ${U}`);
		let W = U === "*", G = W ? {
			usersAreaUsed: W,
			writingFormatConversionMode: u.readU8(),
			drcsConversionMode: (u.readU8() & 192) >> 6
		} : { usersAreaUsed: W }, he = {
			pageMaterialType: _,
			displayTimingType: v,
			timingUnitType: y,
			displayTiming: x,
			clearTiming: E,
			timeControlMode: D,
			clearScreen: le,
			displayFormat: ue,
			displayAspectRatio: j,
			displayWindowArea: de,
			scrollType: I,
			scrollDirectionType: L,
			sound: z,
			pageDataBytes: fe,
			deleted: pe,
			memo: V,
			completed: me
		};
		if (c += l, s.byteLength < c + 1 + 2) continue;
		let K = s.getUint16(c + 1, !1);
		if (c += 3, s.byteLength < c + K) continue;
		let q = ee(o.subarray(c, c + K));
		if (q == null || q.tag !== "CaptionManagement") continue;
		if (m === "000000") {
			Se.push({
				...he,
				...G,
				pageNumber: m,
				tag: "ReservedPage",
				management: q
			});
			continue;
		}
		if (c += K, s.byteLength < c + 1 + 3) continue;
		let J = s.getUint16(c + 1, !1) << 8 | s.getUint8(c + 3);
		if (c += 4, s.byteLength < c + J) continue;
		let Y = ee(o.subarray(c, c + J));
		Y == null || Y.tag !== "CaptionStatement" || Se.push({
			...he,
			...G,
			tag: "ActualPage",
			pageNumber: m,
			management: q,
			statement: Y
		});
	}
	return {
		label: _,
		broadcasterIdentification: b,
		materialNumber: ae,
		programTitle: oe,
		programSubtitle: se,
		programMaterialType: x,
		registrationMode: S,
		languageCode: C,
		displayMode: ce,
		programType: E,
		sound: O,
		totalPages: le,
		totalBytes: k,
		untime: ue,
		realtimeTimingType: j,
		timingUnitType: M,
		initialTime: I,
		syncronizationMode: L,
		timeControlMode: R,
		extensible: fe,
		compatible: pe,
		expireDate: H,
		author: me,
		creationDateTime: W,
		broadcastStartDate: he,
		broadcastEndDate: q,
		broadcastDaysOfWeek: Y,
		broadcastStartTime: ge,
		broadcastEndTime: _e,
		memo: ve,
		completed: ye,
		...xe,
		pages: Se
	};
};
//#endregion
export { r as TimingUnitType, m as default };
