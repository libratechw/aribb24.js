import e from "../../../util/concat.mjs";
import { CompositionState as t, EndSegment as n, ObjectDefinitionSegment as r, PaletteDefinitionSegment as i, PresentationCompositionSegment as a, SegmentType as o, SequenceFlag as s, WindowDefinitionSegment as c, encodeSegment as l } from "../../encoder/pgs/index.mjs";
import { encodeSupFormat as u, ycbcr as d } from "../pgs/index.mjs";
//#region src/lib/muxer/sup/index.ts
var f = (f, p, m, h, g, _, v, y) => {
	let b = [];
	for (let e = 0; e < y[1]; e++) for (let t = 0; t < y[0]; t++) {
		let n = (e * y[0] + t) * 4, r = m[n + 0], i = m[n + 1], a = m[n + 2], o = m[n + 3], s = r * 2 ** 24 + i * 2 ** 16 + a * 2 ** 8 + o;
		if (g.has(s)) {
			b.push(g.get(s));
			continue;
		}
		let c = Infinity, l = -1;
		for (let e = 0; e < h.length; e++) {
			let [t, n, s, u] = h[e], d = (t - r) ** 2 + (n - i) ** 2 + (s - a) ** 2 + (u - o) ** 2;
			d < c && (c = d, l = e);
		}
		b.push(l);
	}
	let x = [];
	for (let e = 0; e < b.length;) {
		let t = b[e] + 1, n = 0;
		for (; e + n < b.length && b[e] === b[e + n];) n++;
		for (e += n; n > 0;) if (n === 1) {
			x.push(t);
			break;
		} else if (n <= 63) {
			x.push(0), x.push(128 | n), x.push(t);
			break;
		} else {
			let e = Math.min(63 * 2 ** 8 - 1, n);
			x.push(0), x.push(192 | Math.floor(e / 2 ** 8)), x.push(Math.floor(e % 2 ** 8)), x.push(t), n -= e;
		}
	}
	let S = Uint8Array.from(x).buffer, C = [];
	for (let e = 0, t = 0; t < S.byteLength; e++) {
		let n = 2 ** 16 - 1 - (e === 0 ? 11 : 4), r = S.slice(t, t + n);
		C.push(r), t += n;
	}
	let w = {
		width: _[0],
		height: _[1],
		frameRate: 30,
		compositionNumber: 0,
		compositionState: t.EpochStart,
		paletteUpdateFlag: !0,
		paletteId: 0,
		numberOfCompositionObject: 0,
		compositionObjects: []
	}, T = {
		width: _[0],
		height: _[1],
		frameRate: 30,
		compositionNumber: 0,
		compositionState: t.EpochStart,
		paletteUpdateFlag: !1,
		paletteId: 0,
		numberOfCompositionObject: 1,
		compositionObjects: [{
			objectId: 0,
			windowId: 0,
			objectCroppedFlag: !1,
			objectHorizontalPosition: v[0],
			objectVerticalPosition: v[1]
		}]
	}, E = {
		numberOfWindow: 1,
		windows: [{
			windowId: 0,
			windowHorizontalPosition: v[0],
			windowVerticalPosition: v[1],
			windowWidth: y[0],
			windowHeight: y[1]
		}]
	}, D = {
		paletteID: 0,
		paletteVersionNumber: 0,
		paletteEntries: h.map(([e, t, n, r], i) => {
			let [a, o, s] = d(e, t, n);
			return {
				paletteEntryID: i + 1,
				luminance: a,
				colorDifferenceBlue: o,
				colorDifferenceRed: s,
				transparency: r
			};
		})
	}, O = C.reduce((e, t) => e + t.byteLength, 0), k = C.map((e, t) => C.length === 1 || t === 0 ? {
		objectId: 0,
		objectVersionNumber: 0,
		lastInSequenceFlag: C.length === 1 ? s.FirstAndLastInSequence : s.FirstInSequence,
		objectDataLength: O + 4,
		width: y[0],
		height: y[1],
		objectData: e
	} : {
		objectId: 0,
		objectVersionNumber: 0,
		lastInSequenceFlag: t === C.length - 1 ? s.LastInSequence : s.IntermediateSequence,
		objectData: e
	});
	return e(u(Math.floor(f * 9e4), Math.floor(p * 9e4) - k.length - 6, l(o.PCS, a.into(w))), u(Math.floor(f * 9e4), Math.floor(p * 9e4) - k.length - 5, l(o.PDS, i.into(D))), u(Math.floor(f * 9e4), Math.floor(p * 9e4) - k.length - 4, l(o.END, n.into())), u(Math.floor(f * 9e4), Math.floor(p * 9e4) - k.length - 3, l(o.PCS, a.into(T))), u(Math.floor(f * 9e4), Math.floor(p * 9e4) - k.length - 2, l(o.WDS, c.into(E))), u(Math.floor(f * 9e4), Math.floor(p * 9e4) - k.length - 1, l(o.PDS, i.into(D))), ...k.map((e, t) => u(Math.floor(f * 9e4), Math.floor(p * 9e4 - (k.length - t) - 0), l(o.ODS, r.into(e)))), u(Math.floor(f * 9e4), Math.floor(p * 9e4) - 0, l(o.END, n.into())));
}, p = (r, i, s) => {
	let c = {
		width: s[0],
		height: s[1],
		frameRate: 30,
		compositionNumber: 0,
		compositionState: t.EpochStart,
		paletteUpdateFlag: !1,
		paletteId: 0,
		numberOfCompositionObject: 0,
		compositionObjects: []
	};
	return e(u(Math.floor(r * 9e4), Math.floor(i * 9e4) - 1, l(o.PCS, a.into(c))), u(Math.floor(r * 9e4), Math.floor(i * 9e4) - 0, l(o.END, n.into())));
};
//#endregion
export { p as makeEmptySup, f as makeImageDataSup };
