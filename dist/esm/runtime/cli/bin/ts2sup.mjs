#!/usr/bin/env node
import { ARIBB24Parser as e } from "../../../lib/parser/parser.mjs";
import t from "../../common/colortable.mjs";
import { CanvasRendererOption as n } from "../../common/renderer/canvas/renderer-option.mjs";
import r from "../../common/namedcolor.mjs";
import i from "../../common/renderer/canvas/renderer-strategy.mjs";
import a from "../../../util/concat.mjs";
import o from "../../../lib/demuxer/mpegts/index.mjs";
import { exit as s } from "../exit.mjs";
import { readableStream as c, writableStream as l } from "../stream.mjs";
import { makeEmptySup as u, makeImageDataSup as d } from "../../../lib/muxer/sup/index.mjs";
import { args as f, parseArgs as p } from "../args.mjs";
import { getTokenizeInformation as m } from "../info.mjs";
//#region src/runtime/cli/bin/ts2sup.ts
var h = (n, o, s, c, l, f, p) => {
	let m = Infinity, h = Infinity, g = 0, _ = 0, v = 0, y = /* @__PURE__ */ new Set(), b = new Set(f.color.stroke ? [r.get(f.color.stroke) ?? f.color.stroke] : []);
	for (let n of s) {
		if (n.tag === "ClearScreen") {
			v = n.time;
			continue;
		}
		m = Math.min(m, n.state.margin[0] + n.state.position[0]), h = Math.min(h, n.state.margin[1] + n.state.position[1] - e.box(n.state)[1]), g = Math.max(g, n.state.margin[0] + n.state.position[0] + e.box(n.state)[0]), _ = Math.max(_, n.state.margin[1] + n.state.position[1]), b.add(f.color.background ? r.get(f.color.background) ?? f.color.background : t[n.state.background]), n.state.ornament != null && b.add(f.color.stroke ? r.get(f.color.stroke) ?? f.color.stroke : t[n.state.ornament]), y.add(t[n.state.foreground]);
	}
	let x = [m, h], S = [g - m, _ - h];
	if (S[0] === -Infinity || S[1] === -Infinity) return u(n, o, c);
	let C = Array.from(b).map((e) => [
		Number.parseInt(e.slice(1, 3), 16),
		Number.parseInt(e.slice(3, 5), 16),
		Number.parseInt(e.slice(5, 7), 16),
		Number.parseInt(e.slice(7, 9), 16)
	]), w = Array.from(y).map((e) => [
		Number.parseInt(e.slice(1, 3), 16),
		Number.parseInt(e.slice(3, 5), 16),
		Number.parseInt(e.slice(5, 7), 16),
		Number.parseInt(e.slice(7, 9), 16)
	]), T = [
		[
			0,
			0,
			0,
			0
		],
		...w,
		...C
	];
	for (let [e, t, n, r] of w) T.push([
		e,
		t,
		n,
		0
	]);
	let E = Math.min(12, Math.floor((256 - T.length) / (2 + (C.length + 2) * w.length)));
	for (let [e, t, n, r] of w) for (let [i, a, o, s] of [
		...C,
		[
			e,
			t,
			n,
			0
		],
		[
			0,
			0,
			0,
			0
		]
	]) for (let c = 1; c < E; c++) {
		let l = Math.floor(e + (i - e) * c / E), u = Math.floor(t + (a - t) * c / E), d = Math.floor(n + (o - n) * c / E), f = Math.floor(r + (s - r) * c / E);
		T.push([
			l,
			u,
			d,
			f
		]);
	}
	{
		let [e, t, n, r] = [
			0,
			0,
			0,
			255
		], [i, a, o, s] = [
			0,
			0,
			0,
			128
		];
		for (let c = 1; c < E; c++) {
			let l = Math.floor(e + (i - e) * c / E), u = Math.floor(t + (a - t) * c / E), d = Math.floor(n + (o - n) * c / E), f = Math.floor(r + (s - r) * c / E);
			T.push([
				l,
				u,
				d,
				f
			]);
		}
	}
	{
		let [e, t, n, r] = [
			0,
			0,
			0,
			128
		], [i, a, o, s] = [
			0,
			0,
			0,
			0
		];
		for (let c = 1; c < E; c++) {
			let l = Math.floor(e + (i - e) * c / E), u = Math.floor(t + (a - t) * c / E), d = Math.floor(n + (o - n) * c / E), f = Math.floor(r + (s - r) * c / E);
			T.push([
				l,
				u,
				d,
				f
			]);
		}
	}
	let D = /* @__PURE__ */ new Map();
	for (let [e, t, n, r] of [
		[
			0,
			0,
			0,
			0
		],
		...w,
		...C
	]) {
		let i = e * 2 ** 24 + t * 2 ** 16 + n * 2 ** 8 + r, a = T.findIndex(([i, a, o, s]) => i === e && a === t && o === n && s === r);
		a < 0 || D.set(i, a);
	}
	let O = p.createCanvas(c[0], c[1]);
	i(O, p.Path2D, [1, 1], s, l, f);
	let k = O.getContext("2d").getImageData(x[0], x[1], S[0], S[1]);
	return v === 0 ? d(n, o, k.data, T, D, c, x, S) : a(d(n, o, k.data, T, D, c, x, S), u(n + v, o + v, c));
}, g = [
	{
		long: "--input",
		short: "-i",
		help: "Specify Input File (.ts)",
		action: "default"
	},
	{
		long: "--output",
		short: "-o",
		help: "Specify Output File (.sup)",
		action: "default"
	},
	{
		long: "--stroke",
		short: "-s",
		help: "Specify forced stroke",
		action: "default"
	},
	{
		long: "--background",
		short: "-b",
		help: "Specify background color",
		action: "default"
	},
	{
		long: "--font",
		short: "-f",
		help: "Specify font",
		action: "default"
	},
	{
		long: "--glyph",
		short: "-g",
		help: "Specify use Embedded Glyph",
		action: "store_true"
	},
	{
		long: "--language",
		short: "-l",
		help: "Specify language",
		action: "default"
	},
	{
		long: "--help",
		short: "-h",
		help: "Show help message",
		action: "help"
	}
];
(async () => {
	let t = p(f(), g, "ts2sup", "MPEG-TS ARIB Caption (Profile A) to SUP (HDMV-PGS)"), r = t.input ?? "-", i = t.output ?? "-", a = t.stroke ?? null, u = t.background ?? null, d = t.font ?? "'Hiragino Maru Gothic Pro', 'BIZ UDGothic', 'Yu Gothic Medium', 'IPAGothic', sans-serif", _ = Number.isNaN(Number.parseInt(t.language)) ? t.language ?? 0 : Number.parseInt(t.language), v = t.glyph ? (await import("../../common/additional-symbols-glyph.mjs").catch(() => ({ default: /* @__PURE__ */ new Map() }))).default : /* @__PURE__ */ new Map(), y = await import("@napi-rs/canvas").catch(() => (console.error("Please install @napi-rs/canvas"), s(-1))), b = (await l(i)).getWriter();
	{
		let t = null, i = null;
		for await (let s of o(await c(r))) {
			if (s.tag !== "Caption") continue;
			let r = s.data;
			if (r.tag === "CaptionManagement") i = typeof _ == "number" ? _ : [...r.languages].sort(({ lang: e }, { lang: t }) => e - t).filter(({ iso_639_language_code: e }) => e === _)?.[0]?.lang ?? null, t = r;
			else if (t == null) continue;
			else {
				let o = t.languages.find((e) => e.lang === r.lang);
				if (o == null || i !== r.lang) continue;
				let c = m(o.iso_639_language_code, o.TCS, "UNKNOWN");
				if (c == null) continue;
				let [l, f, p] = c, g = new e(p, { magnification: 2 }), _ = n.from({
					font: { normal: d },
					replace: { glyph: v },
					color: {
						stroke: a,
						background: u
					}
				}), x = {
					association: l,
					language: o.iso_639_language_code
				};
				b.write(new Uint8Array(h(s.pts, s.dts, g.parse(f.tokenize(s.data)), g.currentState().plane, x, _, y)));
			}
		}
	}
	b.close();
})();
//#endregion
