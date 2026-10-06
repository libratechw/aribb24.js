import { ByteBuilder as e } from "../../../util/bytebuilder.mjs";
//#region src/lib/muxer/pgs/index.ts
var t = (t, n, r) => {
	let i = new e();
	return i.writeU16(20551), i.writeU32(t), i.writeU32(n), i.write(r), i.build();
}, n = (e, t, n) => [
	Math.max(0, Math.min(255, Math.round(.299 * e + .587 * t + .114 * n))),
	Math.max(-128, Math.min(127, Math.round(-.168736 * e - .331264 * t + .5 * n))) + 128,
	Math.max(-128, Math.min(127, Math.round(.5 * e - .418688 * t - .081312 * n))) + 128
];
//#endregion
export { t as encodeSupFormat, n as ycbcr };
