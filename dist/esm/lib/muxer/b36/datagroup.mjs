import { ExhaustivenessError as e, ViolationStandardError as t } from "../../../util/error.mjs";
import { TimeControlModeType as n } from "../../demuxer/b24/datagroup.mjs";
import { ByteBuilder as r } from "../../../util/bytebuilder.mjs";
//#region src/lib/muxer/b36/datagroup.ts
var i = (t) => {
	switch (t.tag) {
		case "Statement": return 32;
		case "DRCS": return t.bytes === 2 ? 49 : 48;
		case "Bitmap": return 53;
		default: throw new e(t, "Unexpected Data Unit in STD-B24 ARIB Caption");
	}
}, a = (a) => {
	let o = new r();
	for (let e of a.units) o.writeU8(31), o.writeU8(i(e)), o.writeU24(e.data.byteLength), o.write(e.data.buffer.slice(e.data.byteOffset, e.data.byteOffset + e.data.byteLength));
	let s = o.build();
	switch (a.tag) {
		case "CaptionManagement": {
			let e = new r();
			if (a.languages.length !== 1) throw new t("ARIB STD-B36 must only one language");
			for (let t of a.languages) e.writeU8(16 | t.displayMode), e.writeU8(0), e.writeU8(t.iso_639_language_code.charCodeAt(0)), e.writeU8(t.iso_639_language_code.charCodeAt(1)), e.writeU8(t.iso_639_language_code.charCodeAt(2)), e.writeU8(t.format << 4 | t.TCS << 2 | t.rollup);
			let i = e.build(), o = new r();
			if (o.writeU8(63), a.timeControlMode !== n.FREE) throw new t("TimeControlMode (TMD) must be 0 (FREE)");
			o.writeU8(0), o.writeU8(0), o.writeU8(0), o.writeU8(0), o.writeU8(15), o.writeU8(0), o.write(i);
			let s = o.build(), c = new r();
			return c.writeU8(0), c.writeU8(0), c.writeU8(0), c.writeU16(s.byteLength), c.write(s), c.build();
		}
		case "CaptionStatement": {
			let e = new r();
			if (e.writeU8(63), a.timeControlMode !== n.FREE) throw new t("TimeControlMode (TMD) must be 0 (FREE)");
			e.writeU8(0), e.writeU8(0), e.writeU8(0), e.writeU8(0), e.writeU8(15), e.writeU24(s.byteLength), e.write(s);
			let i = e.build(), o = new r();
			return o.writeU8(4), o.writeU8(0), o.writeU8(0), o.writeU16(i.byteLength), o.write(i), o.build();
		}
		default: throw new e(a, "Unexpected STD-B24 ARIB Caption Content");
	}
};
//#endregion
export { a as default };
