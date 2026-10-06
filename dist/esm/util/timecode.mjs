import { UnexpectedFormatError as e } from "./error.mjs";
//#region src/util/timecode.ts
var t = /^(\d\d):(\d\d):(\d\d);(\d\d)$/, n = 1e-5, r = (n) => {
	let r = n.match(t);
	if (r == null) throw new e("Unexpected TimeCode");
	let i = Number.parseInt(r[1], 10), a = Number.parseInt(r[2], 10), o = Number.parseInt(r[3], 10), s = Number.parseInt(r[4], 10), c = i * 60 + a;
	return ((i * 60 + a) * 60 + o) * 30 + s - (c - Math.floor(c / 10)) * 2;
}, i = (e) => Math.floor(e * 3e4 / 1001 + n), a = (e) => {
	let t = Math.floor(e / 107892), n = Math.floor((e + 2 * Math.floor((e - 107892 * t) / 1800) - 2 * Math.floor((e - 107892 * t) / 18e3) - 107892 * t) / 1800), r = Math.floor((e - 1798 * n - 2 * Math.floor(n / 10) - 107892 * t) / 30), i = e - 30 * r - 1798 * n - 2 * Math.floor(n / 10) - 107892 * t;
	return `${t.toString(10).padStart(2, "0")}:${n.toString(10).padStart(2, "0")}:${r.toString(10).padStart(2, "0")};${i.toString(10).padStart(2, "0")}`;
}, o = (e) => Math.ceil(e * 1001 / 3e4 * 1e3) / 1e3, s = (e) => a(i(e)), c = (e) => o(r(e));
//#endregion
export { s as secondsToTimecode, c as timecodeToSecond };
