import { adaptation_field_length as e, has_adaptation_field as t, payload_unit_start_indicator as n } from "./packet.mjs";
var r = (e) => e[3], i = (e) => e[4] << 8 | e[5], a = (e) => {
	let t = r(e);
	return t !== 188 && t !== 190 && t !== 191 && t !== 240 && t !== 241 && t !== 255 && t !== 242 && t !== 248;
}, o = (e) => a(e) ? (e[7] & 128) != 0 : !1, s = (e) => a(e) ? (e[7] & 64) != 0 : !1, c = (e) => {
	if (!o(e)) return null;
	let t = 0;
	return t *= 8, t += (e[9] & 14) >> 1, t *= 256, t += (e[10] & 255) >> 0, t *= 128, t += (e[11] & 254) >> 1, t *= 256, t += (e[12] & 255) >> 0, t *= 128, t += (e[13] & 254) >> 1, t;
}, l = (e) => {
	if (!s(e)) return null;
	let t = o(e) ? 5 : 0, n = 0;
	return n *= 8, n += (e[9 + t + 0] & 14) >> 1, n *= 256, n += (e[9 + t + 1] & 255) >> 0, n *= 128, n += (e[9 + t + 2] & 254) >> 1, n *= 256, n += (e[9 + t + 3] & 255) >> 0, n *= 128, n += (e[9 + t + 4] & 254) >> 1, n;
}, u = (e) => a(e) ? 3 + e[8] : 0, d = (e) => i(e) === 0 ? !1 : e.byteLength >= 6 + i(e), f = class {
	accendant = new Uint8Array();
	*feed(r) {
		let a = r.subarray(4 + (t(r) ? 1 + e(r) : 0));
		if (n(r)) this.accendant.byteLength > 0 && i(this.accendant) === 0 && (yield this.accendant), this.accendant = a;
		else if (this.accendant.byteLength > 0) {
			let e = this.accendant;
			this.accendant = new Uint8Array(this.accendant.byteLength + a.byteLength), this.accendant.set(e, 0), this.accendant.set(a, e.byteLength);
		}
		d(this.accendant) && (yield this.accendant.subarray(0, 6 + i(this.accendant)), this.accendant = new Uint8Array());
	}
};
//#endregion
export { l as DTS, u as PES_header_length, c as PTS, f as default };
