var e = 2 ** 33, t = (e) => (e[1] & 64) != 0, n = (e) => (e[1] & 31) << 8 | e[2], r = (e) => (e[3] & 32) != 0, i = (e) => r(e) ? e[4] : 0, a = (e) => e[4 + (r(e) ? 1 + i(e) : 0)], o = class extends TransformStream {
	constructor(e, t) {
		let n = new Uint8Array();
		super({ transform(e, t) {
			{
				let t = n;
				n = new Uint8Array(n.byteLength + e.byteLength), n.set(t, 0), n.set(e, t.byteLength);
			}
			for (let e = 0; e < n.byteLength; e++) if (n[e] === 71) {
				if (e + 188 > n.byteLength) {
					n = n.subarray(e);
					return;
				}
				t.enqueue(n.subarray(e, e + 188)), e += 187;
			}
			n = new Uint8Array();
		} }, e, t);
	}
};
//#endregion
export { e as TIMESTAMP_ROLLOVER, i as adaptation_field_length, o as default, r as has_adaptation_field, t as payload_unit_start_indicator, n as pid, a as pointer_field };
