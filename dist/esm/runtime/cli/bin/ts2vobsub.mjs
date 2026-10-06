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
import { args as u, parseArgs as d } from "../args.mjs";
import { getTokenizeInformation as f } from "../info.mjs";
import { encode as p } from "../../../lib/encoder/vobsub/index.mjs";
import { makePES as m, makePS as h } from "../../../lib/muxer/vobsub/index.mjs";
import { writeFS as g } from "../file.mjs";
//#region src/runtime/cli/bin/ts2vobsub.ts
var _ = (e) => {
	let t = Math.floor(e * 1e3) - Math.floor(e) * 1e3, n = Math.floor(e) % 60, r = Math.floor(e / 60) % 60;
	return `${(Math.floor(e / 3600) % 60).toString(10).padStart(2, "0")}:${r.toString(10).padStart(2, "0")}:${n.toString(10).padStart(2, "0")}:${t.toString(10).padStart(3, "0")}`;
}, v = (n, a, o, c, l, u, d) => {
	let f = Infinity, m = Infinity, h = 0, g = 0, _ = 0, v = new Set(["#00000000"]);
	for (let n of a) {
		if (n.tag === "ClearScreen") {
			_ = n.time;
			continue;
		}
		f = Math.min(f, n.state.margin[0] + n.state.position[0]), m = Math.min(m, n.state.margin[1] + n.state.position[1] - e.box(n.state)[1]), h = Math.max(h, n.state.margin[0] + n.state.position[0] + e.box(n.state)[0]), g = Math.max(g, n.state.margin[1] + n.state.position[1]), v.add(u.color.background ? r.get(u.color.background) ?? u.color.background : t[n.state.background]), v.add(u.color.foreground ? r.get(u.color.foreground) ?? u.color.foreground : t[n.state.foreground]), n.state.ornament != null && v.add(u.color.stroke ? r.get(u.color.stroke) ?? u.color.stroke : t[n.state.ornament]);
	}
	let y = [f, m], b = [h - f, g - m];
	if (b[0] === -Infinity || b[1] === -Infinity) return null;
	o = _ > 0 ? _ : o;
	let x = Array.from(v.values());
	if (x.length > 4) return console.error("Maxium SPU simultaneous displays color exceeded!"), s(-1);
	for (; x.length < 4;) x.push("#00000000");
	let S = d.createCanvas(c[0], c[1]);
	i(S, d.Path2D, [1, 1], a, l, u);
	let C = S.getContext("2d").getImageData(y[0], y[1], b[0], b[1]);
	return p(y[0], y[1], b[0], b[1], C.data, o, x, n);
}, y = [
	{
		long: "--input",
		short: "-i",
		help: "Specify Input File (.ts)",
		action: "default"
	},
	{
		long: "--output",
		short: "-o",
		help: "Specify Output Sub File (.sub)",
		action: "default"
	},
	{
		long: "--index",
		short: "-x",
		help: "Specify Output Idx File (.idx)",
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
		long: "--foreground",
		short: "-p",
		help: "Specify foreground color",
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
], b = async (e, t, n) => {
	let r = null, i = null, a = null;
	for (let o of e) {
		if (o.tag !== "Caption") continue;
		let e = o.data;
		if (e.tag === "CaptionManagement") i = typeof t == "number" ? t : [...e.languages].sort(({ lang: e }, { lang: t }) => e - t).filter(({ iso_639_language_code: e }) => e === t)?.[0]?.lang ?? null, r = e;
		else if (r == null) continue;
		else {
			let t = r.languages.find((t) => t.lang === e.lang);
			if (t == null || i !== e.lang) continue;
			let s = f(t.iso_639_language_code, t.TCS, "UNKNOWN");
			if (s == null) continue;
			let [c, l, u] = s;
			a?.(o), a = (e) => n(t, c, l, u, o, e);
		}
		a?.(null);
	}
};
(async () => {
	let i = d(u(), y, "ts2vobsub", "MPEG-TS ARIB Caption (Profile A) to VOBSUB (DVD-Video)"), f = i.input ?? "-", p = i.output ?? null, x = i.index ?? null;
	if (p == null || x == null) return console.error("Please Specify Output Sub/Idx file"), s(-1);
	let S = i.stroke ?? null, C = i.background ?? null, w = i.foreground ?? "white", T = i.font ?? "'Hiragino Maru Gothic Pro', 'BIZ UDGothic', 'Yu Gothic Medium', 'IPAGothic', sans-serif", E = Number.isNaN(Number.parseInt(i.language)) ? i.language ?? 0 : Number.parseInt(i.language), D = i.glyph ? (await import("../../common/additional-symbols-glyph.mjs").catch(() => ({ default: /* @__PURE__ */ new Map() }))).default : /* @__PURE__ */ new Map(), O = await import("@napi-rs/canvas").catch(() => (console.error("Please install @napi-rs/canvas"), s(-1))), k = (await l(p)).getWriter(), A = [];
	for await (let e of o(await c(f))) A.push(e);
	let j = new Set(["#000000"]), M = [-1, -1];
	if (b(A, E, (i, a, o, s, c) => {
		let l = new e(s, { magnification: 2 }), u = n.from({
			font: { normal: T },
			replace: { glyph: D },
			color: {
				stroke: S,
				background: C,
				foreground: w
			}
		});
		i.iso_639_language_code;
		for (let e of l.parse(o.tokenize(c.data))) {
			let n = u.color.background ? r.get(u.color.background) ?? u.color.background : t[e.state.background];
			j.add(n.slice(0, 7));
			let i = u.color.foreground ? r.get(u.color.foreground) ?? u.color.foreground : t[e.state.foreground];
			if (j.add(i.slice(0, 7)), e.state.ornament != null) {
				let n = u.color.stroke ? r.get(u.color.stroke) ?? u.color.stroke : t[e.state.ornament];
				j.add(n.slice(0, 7));
			}
		}
		M = l.currentState().plane;
	}), M[0] < 0 || M[1] < 0) return console.error("Caption not found..."), s(-1);
	let N = Array.from(j.values());
	if (N.length > 16) return console.error("Maxium SUP palette size exceeded!"), s(-1);
	for (; N.length < 16;) N.push("#000000");
	let P = 0, F = [];
	b(A, E, (t, r, i, o, s, c) => {
		let l = new e(o, { magnification: 2 }), u = n.from({
			font: { normal: T },
			replace: { glyph: D },
			color: {
				stroke: S,
				background: C,
				foreground: w
			}
		}), d = {
			association: r,
			language: t.iso_639_language_code
		}, f = c == null ? null : (Math.floor((c.pts - s.pts) * 9e4) + 2 ** 33) % 2 ** 33 / 9e4, p = v(N, l.parse(i.tokenize(s.data)), f, l.currentState().plane, d, u, O);
		if (p == null) return;
		let g = h(m(a(Uint8Array.from([32]).buffer, p), Math.floor(s.pts * 9e4)), Math.floor(s.pts * 9e4));
		F.push([s.pts, P]), P += g.byteLength, k.write(new Uint8Array(g));
	}), k.close();
	let I = "";
	I += "# VobSub index file, v7 (do not modify this line!)\n", I += "\n\n", I += "# Settings\n", I += "\n", I += "# Original frame size\n", I += `size: ${M[0]}x${M[1]}\n`, I += "\n", I += "# Origin, relative to the upper-left corner, can be overloaded by aligment\n", I += "org: 0, 0\n", I += "\n", I += "# Image scaling (hor,ver), origin is at the upper-left corner or at the alignment coord (x, y)\n", I += "scale: 100%, 100%\n", I += "\n", I += "# Alpha blending\n", I += "alpha: 100%\n", I += "\n", I += "# Smoothing for very blocky images (use OLD for no filtering)\n", I += "smooth: OFF\n", I += "\n", I += "# In millisecs\n", I += "fadein/out: 0, 0\n", I += "\n", I += "# Force subtitle placement relative to (org.x, org.y)\n", I += "align: OFF at LEFT TOP\n", I += "\n", I += "# For correcting non-progressive desync. (in millisecs or hh:mm:ss:ms)\n", I += "# Note: Not effective in DirectVobSub, use \"delay: ... \" instead.\n", I += "time offset: 0\n", I += "\n", I += "# ON: displays only forced subtitles, OFF: shows everything\n", I += "forced subs: OFF\n", I += "\n", I += "# The original palette of the DVD\n", I += `palette: ${N.map((e) => e.slice(1).toLowerCase()).join(", ")}\n`, I += "\n", I += "# Custom colors (transp idxs and the four colors)\n", I += "custom colors: OFF, tridx: 1000, colors: ffffff, faff1a, 24e731, 000000\n", I += "\n", I += "# Language index in use\n", I += "langidx: 0\n", I += "\n", I += "# ARIB\n", I += "id: und, index: 0\n", I += "# Decomment next line to activate alternative name in DirectVobSub / Windows Media Player 6.x\n", I += "# alt: ARIB\n", I += "# Vob/Cell ID: 1, 4 (PTS: 1221921)\n";
	for (let [e, t] of F) I += `timestamp: ${_(e)}, filepos: ${t.toString(16).padStart(8, "0")}\n`;
	g(x, I);
})();
//#endregion
