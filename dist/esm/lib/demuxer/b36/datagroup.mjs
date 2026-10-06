import { ByteStream as e } from "../../../util/bytestream.mjs";
import { BCDtoHHMMSSsss as t, TimeControlModeType as n } from "../b24/datagroup.mjs";
//#region src/lib/demuxer/b36/datagroup.ts
var r = (r) => {
	let i = new e(r), a = (i.readU8() & 252) >> 2, o = (a & 32) >> 5, s = a & 15;
	if (i.readU8(), i.readU8(), i.readU16(), s === 0) {
		let e = (i.readU8() & 192) >> 6, r = t(i), a = e === n.OFFSETTIME ? {
			timeControlMode: e,
			offsetTime: r
		} : { timeControlMode: e };
		i.readU8();
		let s = [];
		for (let e = 0; e < 1; e++) {
			let e = i.readU8(), t = (e & 224) >> 5, n = e & 15, r = i.readU8(), a = n === 12 || n === 13 || n === 14 ? {
				displayMode: n,
				displayConditionDesignation: r
			} : { displayMode: n }, o = String.fromCharCode(i.readU8(), i.readU8(), i.readU8()), c = i.readU8(), l = (c & 240) >> 4, u = (c & 12) >> 2, d = c & 3;
			s.push({
				...a,
				lang: t,
				iso_639_language_code: o,
				TCS: u,
				format: l,
				rollup: d
			});
		}
		return {
			...a,
			tag: "CaptionManagement",
			group: o,
			languages: s,
			units: []
		};
	} else {
		let e = (i.readU8() & 192) >> 6, r = t(i), a = e === n.REALTIME || e === n.OFFSETTIME ? {
			timeControlMode: e,
			presentationStartTime: r
		} : { timeControlMode: e }, c = i.readU24(), l = [], u = 0;
		for (; u < c;) {
			i.readU8();
			let e = i.readU8(), t = i.readU24();
			switch (e) {
				case 32:
					l.push({
						tag: "Statement",
						data: i.read(t)
					});
					break;
				case 48:
					l.push({
						tag: "DRCS",
						bytes: 1,
						data: i.read(t)
					});
					break;
				case 49:
					l.push({
						tag: "DRCS",
						bytes: 2,
						data: i.read(t)
					});
					break;
				case 53:
					l.push({
						tag: "Bitmap",
						data: i.read(t)
					});
					break;
				default:
					i.read(t);
					break;
			}
			u += 5 + t;
		}
		return {
			...a,
			tag: "CaptionStatement",
			group: o,
			lang: s - 1,
			units: l
		};
	}
};
//#endregion
export { r as default };
