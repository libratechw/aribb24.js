import { ExhaustivenessError as e } from "../../../util/error.mjs";
import { TimeControlModeType as t } from "../../demuxer/b24/datagroup.mjs";
import { ByteBuilder as n } from "../../../util/bytebuilder.mjs";
import r from "../../../util/crc16-ccitt.mjs";
//#region src/lib/muxer/b24/datagroup.ts
var i = (t) => {
	switch (t.tag) {
		case "Statement": return 32;
		case "DRCS": return t.bytes === 2 ? 49 : 48;
		case "Bitmap": return 53;
		default: throw new e(t, "Unexpected Data Unit in STD-B24 ARIB Caption");
	}
}, a = (a) => {
	let o = new n();
	for (let e of a.units) o.writeU8(31), o.writeU8(i(e)), o.writeU24(e.data.byteLength), o.write(e.data.buffer.slice(e.data.byteOffset, e.data.byteOffset + e.data.byteLength));
	let s = o.build();
	switch (a.tag) {
		case "CaptionManagement": {
			let e = new n();
			for (let t of a.languages) e.writeU8(t.lang << 5 | 16 | t.displayMode), (t.displayMode === 12 || t.displayMode === 13 || t.displayMode === 14) && e.writeU8(t.displayConditionDesignation), e.writeU8(t.iso_639_language_code.charCodeAt(0)), e.writeU8(t.iso_639_language_code.charCodeAt(1)), e.writeU8(t.iso_639_language_code.charCodeAt(2)), e.writeU8(t.format << 4 | t.TCS << 2 | t.rollup);
			let t = e.build(), i = new n();
			if (i.writeU8(a.timeControlMode << 6 | 63), a.timeControlMode === 2) {
				let e = Math.floor(a.offsetTime[0] / 10) << 4 | a.offsetTime[0] % 10 << 0, t = Math.floor(a.offsetTime[1] / 10) << 4 | a.offsetTime[1] % 10 << 0, n = Math.floor(a.offsetTime[2] / 10) << 4 | a.offsetTime[2] % 10 << 0, r = Math.floor(a.offsetTime[3] / 100) << 4 | Math.floor(a.offsetTime[3] / 10) % 10 << 0, o = Math.floor(a.offsetTime[3] % 10) << 4 | 15;
				i.writeU8(e), i.writeU8(t), i.writeU8(n), i.writeU8(r), i.writeU8(o);
			}
			i.writeU8(a.languages.length), i.write(t), i.writeU24(s.byteLength), i.write(s);
			let o = i.build(), c = new n();
			return c.writeU8(a.group << 7 | 0), c.writeU8(0), c.writeU8(0), c.writeU16(o.byteLength), c.write(o), c.writeU16(r(new Uint8Array(c.build()))), c.build();
		}
		case "CaptionStatement": {
			let e = new n();
			if (e.writeU8(a.timeControlMode << 6 | 63), a.timeControlMode === t.REALTIME || a.timeControlMode === t.OFFSETTIME) {
				let t = Math.floor(a.presentationStartTime[0] / 10) << 4 | a.presentationStartTime[0] % 10 << 0, n = Math.floor(a.presentationStartTime[1] / 10) << 4 | a.presentationStartTime[1] % 10 << 0, r = Math.floor(a.presentationStartTime[2] / 10) << 4 | a.presentationStartTime[2] % 10 << 0, i = Math.floor(a.presentationStartTime[3] / 100) << 4 | Math.floor(a.presentationStartTime[3] / 10) % 10 << 0, o = a.presentationStartTime[3] % 10 << 4 | 15;
				e.writeU8(t), e.writeU8(n), e.writeU8(r), e.writeU8(i), e.writeU8(o);
			}
			e.writeU24(s.byteLength), e.write(s);
			let i = e.build(), o = new n();
			return o.writeU8(a.group << 7 | a.lang + 1 << 2 | 0), o.writeU8(0), o.writeU8(0), o.writeU16(i.byteLength), o.write(i), o.writeU16(r(new Uint8Array(o.build()))), o.build();
		}
		default: throw new e(a, "Unexpected STD-B24 ARIB Caption Content");
	}
};
//#endregion
export { a as default };
