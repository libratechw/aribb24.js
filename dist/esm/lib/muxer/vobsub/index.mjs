import e from "../../../util/concat.mjs";
import t from "../../../util/bitbuilder.mjs";
//#region src/lib/muxer/vobsub/index.ts
var n = (n, r) => {
	let i = 8 + n.byteLength, a = Uint8Array.from([
		0,
		0,
		1,
		189,
		(i & 65280) >> 8,
		(i & 255) >> 0
	]), o = new t();
	return o.writeBits(128, 8), o.writeBits(128, 8), o.writeBits(5, 8), o.writeBits(2, 4), o.writeBits(Math.floor(r / 2 ** 30) % 2 ** 3, 3), o.writeBits(1, 1), o.writeBits(Math.floor(r / 2 ** 15) % 2 ** 15, 15), o.writeBits(1, 1), o.writeBits(Math.floor(r / 1) % 2 ** 15, 15), o.writeBits(1, 1), e(a.buffer, o.build(), n);
}, r = (n, r) => {
	let i = Uint8Array.from([
		0,
		0,
		1,
		186
	]), a = new t();
	return a.writeBits(1, 2), a.writeBits(Math.floor(r / 2 ** 30) % 2 ** 3, 3), a.writeBits(1, 1), a.writeBits(Math.floor(r / 2 ** 15) % 2 ** 15, 15), a.writeBits(1, 1), a.writeBits(Math.floor(r / 1) % 2 ** 15, 15), a.writeBits(1, 1), a.writeBits(0, 9), a.writeBits(1, 1), a.writeBits(0, 22), a.writeBits(3, 2), a.writeBits(31, 5), a.writeBits(0, 3), e(i.buffer, a.build(), n);
};
//#endregion
export { n as makePES, r as makePS };
