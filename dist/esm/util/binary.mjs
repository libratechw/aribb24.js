//#region src/util/binary.ts
function e(e, t, n) {
	let r = "";
	for (let i = t; i < n; i++) r += `%${e[i].toString(16).padStart(2, "0")}`;
	return r;
}
function t(t, n, r) {
	if (globalThis.TextDecoder) {
		let e = new globalThis.TextDecoder("utf-8", { fatal: !0 }), i = new Uint8Array(t.subarray(n, r));
		return e.decode(i);
	} else return decodeURIComponent(e(t, n, r));
}
function n(t, n, r) {
	if (globalThis.TextDecoder) {
		let e = new globalThis.TextDecoder("iso-8859-1", { fatal: !0 }), i = new Uint8Array(t.subarray(n, r));
		return e.decode(i);
	} else return unescape(e(t, n, r));
}
function r(e) {
	let t = atob(e), n = new Uint8Array(t.length);
	for (let e = 0; e < t.length; e++) n[e] = t.charCodeAt(e);
	return n;
}
//#endregion
export { r as base64ToUint8Array, n as binaryISO85591ToString, t as binaryUTF8ToString };
