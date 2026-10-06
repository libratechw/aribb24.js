import { adaptation_field_length as e, has_adaptation_field as t, payload_unit_start_indicator as n, pointer_field as r } from "./packet.mjs";
var i = (e) => (e[1] & 15) << 8 | e[2], a = (e, t = 0, n = e.byteLength) => {
	let r = 4294967295;
	for (let i = t; i < n; i++) for (let t = 7; t >= 0; t--) {
		let n = (e[i] & 1 << t) >> t, a = r & 2147483648 ? 1 : 0;
		r <<= 1, a ^ n && (r ^= 79764919), r &= 4294967295;
	}
	return r;
}, o = class {
	accendant = new Uint8Array();
	*feed(a) {
		let o = 4 + (t(a) ? 1 + e(a) : 0);
		if (n(a) && (o += 1), this.accendant.byteLength == 0) if (n(a)) o += r(a);
		else return;
		else {
			let e = o + Math.max(0, 3 + i(this.accendant) - this.accendant.length);
			if (e > 188) {
				let e = this.accendant;
				this.accendant = new Uint8Array(this.accendant.byteLength + (188 - o)), this.accendant.set(e, 0), this.accendant.set(a.subarray(o), e.byteLength);
				return;
			} else {
				let t = new Uint8Array(this.accendant.byteLength + (e - o));
				t.set(this.accendant, 0), t.set(a.subarray(o, e), this.accendant.byteLength), this.accendant = new Uint8Array(), yield t, o = e;
			}
		}
		if (n(a)) for (; o < 188 && a[o] !== 255;) {
			let e = o + Math.max(0, 3 + i(a.subarray(o)));
			if (e > 188) {
				this.accendant = a.subarray(o);
				break;
			}
			yield a.subarray(o, e), o = e;
		}
	}
};
//#endregion
export { a as CRC32, o as default, i as section_length };
