import { binaryISO85591ToString as e, binaryUTF8ToString as t } from "./binary.mjs";
//#region src/util/id3.ts
var n = (e, t, n) => {
	let r = 0;
	for (let i = t; i < n; i++) r <<= 7, r |= e[i] & 127;
	return r;
}, r = { from(t) {
	let n = 0;
	for (; t[n] !== 0 && n < t.byteLength;) n++;
	return {
		id: "PRIV",
		owner: e(t, 0, n),
		data: t.subarray(n + 1)
	};
} }, i = { from(n) {
	let r = 0, i = n[r + 0], a = r + 1;
	if (i === 3) {
		for (; n[r] !== 0 && r < n.byteLength;) r++;
		let e = r;
		r += 1;
		let i = r;
		for (; n[r] !== 0 && r < n.byteLength;) r++;
		let o = r;
		return {
			id: "TXXX",
			description: t(n, a, e),
			text: t(n, i, o)
		};
	} else if (i === 0) {
		for (; n[r] !== 0 && r < n.byteLength;) r++;
		let t = r;
		r += 1;
		let i = r;
		for (; n[r] !== 0 && r < n.byteLength;) r++;
		let o = r;
		return {
			id: "TXXX",
			description: e(n, a, t),
			text: e(n, i, o)
		};
	} else return null;
} }, a = (t) => {
	let a = [];
	for (let o = 0; o < t.length;) {
		let s = o;
		if (o + 3 > t.length) break;
		if (!(t[o + 0] === 73 && t[o + 1] === 68 && t[o + 2] === 51)) if (o === 0) {
			o += 5;
			continue;
		} else break;
		if (o += 6, o + 4 > t.length) break;
		let c = n(t, o + 0, o + 4);
		o += 4;
		let l = s + 3 + 2 + 1 + 4 + c;
		if (l > t.length) break;
		for (let s = o; s < l;) {
			let o = s;
			if (s + 4 > t.length) break;
			let c = e(t, s + 0, s + 4);
			if (s += 4, s + 4 > t.length) break;
			let l = n(t, s + 0, s + 4);
			s += 6;
			let u = o + 4 + 4 + 2 + l;
			if (u > t.length) break;
			switch (c) {
				case "PRIV":
					a.push(r.from(t.subarray(s, u)));
					break;
				case "TXXX": {
					let e = i.from(t.subarray(s, u));
					e != null && a.push(e);
					break;
				}
			}
			s = u;
		}
		o = s + 3 + 2 + 1 + 4 + c, !(o + 3 > t.length) && t[o + 0] === 51 && t[o + 1] === 68 && t[o + 2] === 73 && (o += 10);
	}
	return a;
};
//#endregion
export { a as parseID3v2 };
