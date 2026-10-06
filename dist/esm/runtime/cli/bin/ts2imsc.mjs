#!/usr/bin/env node
import { ARIBB24Parser as e } from "../../../lib/parser/parser.mjs";
import { CanvasRendererOption as t } from "../../common/renderer/canvas/renderer-option.mjs";
import n from "../../common/renderer/canvas/renderer-strategy.mjs";
import { SVGRendererOption as r } from "../../common/renderer/svg/renderer-option.mjs";
import i, { serializeSVG as a } from "../../common/renderer/svg/renderer-strategy.mjs";
import o from "../../../lib/demuxer/mpegts/index.mjs";
import { exit as s } from "../exit.mjs";
import { readableStream as c } from "../stream.mjs";
import { args as l, parseArgs as u } from "../args.mjs";
import { getTokenizeInformation as d } from "../info.mjs";
import { writeFS as f } from "../file.mjs";
//#region src/runtime/cli/bin/ts2imsc.ts
var p = { from(e, t = {}, n = []) {
	return {
		name: e,
		attributes: t,
		children: n
	};
} }, m = (e, t = 0) => {
	if (typeof e == "string") return "  ".repeat(t) + e + "\n";
	let n = Array.from(Object.entries(e.attributes)).map(([e, t]) => `${e}="${t}"`).join(" "), r = "  ".repeat(t) + `<${e.name}${n === "" ? "" : " " + n}${e.children.length === 0 ? " /" : ""}>\n`;
	if (e.children.length === 0) return r;
	for (let n of e.children) r += m(n, t + 1);
	return r += "  ".repeat(t) + `</${e.name}>\n`, r;
}, h = (t, r, i, a, o, s, c, l) => {
	let u = l.createCanvas(o[0], o[1]);
	n(u, l.Path2D, [1, 1], a, s, c);
	let d = Infinity, f = Infinity, m = 0, h = 0, g = !1;
	for (let t of a) t.tag !== "ClearScreen" && (d = Math.min(d, t.state.margin[0] + t.state.position[0]), f = Math.min(f, t.state.margin[1] + t.state.position[1] - e.box(t.state)[1]), m = Math.max(m, t.state.margin[0] + t.state.position[0] + e.box(t.state)[0]), h = Math.max(h, t.state.margin[1] + t.state.position[1]), g = !0);
	if (!g) return null;
	let _ = [];
	{
		let e = m - d, t = h - f, n = l.createCanvas(e, t);
		n.getContext("2d").drawImage(u, d, f, e, t, 0, 0, e, t), _.push([
			d,
			f,
			e,
			t,
			n.toDataURL("image/png")
		]);
	}
	let v = _.map(([e, t, n, r, a], o) => p.from("div", { region: `r_${i}_${o}` }, [p.from("image", {
		"tts:extent": `${n}px ${r}px`,
		type: "image/png",
		src: a
	})]));
	return {
		regions: _.map(([e, t, n, r, a], o) => p.from("region", {
			"xml:id": `r_${i}_${o}`,
			"tts:extent": `${n}px ${r}px`,
			"tts:origin": `${e}px ${t}px`
		})),
		styles: [],
		contents: [p.from("div", {
			begin: `${t.toFixed(3)}s`,
			end: `${r.toFixed(3)}s`
		}, v)]
	};
}, g = (e, t, n, r, o, s) => {
	let c = i(r, o, s), l = Infinity, u = Infinity, d = 0, f = 0, m = !1;
	for (let e of r) e.tag !== "ClearScreen" && (l = Math.min(l, e.state.margin[0]), u = Math.min(u, e.state.margin[1]), d = Math.max(d, e.state.margin[0] + e.state.area[0]), f = Math.max(f, e.state.margin[1] + e.state.area[1]), m = !0);
	if (!m) return null;
	let h = [];
	{
		let e = d - l, t = f - u, n = a(c), r = `data:image/svg+xml,${encodeURIComponent(n)}`;
		h.push([
			l,
			u,
			e,
			t,
			r
		]);
	}
	let g = h.map(([e, t, r, i, a], o) => p.from("div", { region: `r_${n}_${o}` }, [p.from("image", {
		"tts:extent": `${r}px ${i}px`,
		type: "image/svg+xml",
		src: a
	})]));
	return {
		regions: h.map(([e, t, r, i, a], o) => p.from("region", {
			"xml:id": `r_${n}_${o}`,
			"tts:extent": `${r}px ${i}px`,
			"tts:origin": `${e}px ${t}px`
		})),
		styles: [],
		contents: [p.from("div", {
			begin: `${e.toFixed(3)}s`,
			end: `${t.toFixed(3)}s`
		}, g)]
	};
}, _ = [
	{
		long: "--input",
		short: "-i",
		help: "Specify Input File (.ts)",
		action: "default"
	},
	{
		long: "--output",
		short: "-o",
		help: "Specify Output File (.ttml)",
		action: "default"
	},
	{
		long: "--method",
		short: "-m",
		help: "Specify Rendering Method",
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
	let n = u(l(), _, "ts2sup", "MPEG-TS ARIB Caption (Profile A) to SUP (HDMV-PGS)"), i = n.input ?? "-", a = n.output ?? "-", v = n.stroke ?? null, y = (n.method ?? "canvas").toLowerCase(), b = n.background ?? null, x = n.font ?? "'Hiragino Maru Gothic Pro', 'BIZ UDGothic', 'Yu Gothic Medium', 'IPAGothic', sans-serif", S = Number.isNaN(Number.parseInt(n.language)) ? n.language ?? 0 : Number.parseInt(n.language), C = n.glyph ? (await import("../../common/additional-symbols-glyph.mjs").catch(() => ({ default: /* @__PURE__ */ new Map() }))).default : /* @__PURE__ */ new Map(), w = null, T = null, E = [];
	for await (let e of o(await c(i))) {
		if (e.tag !== "Caption") continue;
		let t = e.data;
		if (t.tag === "CaptionManagement") T = typeof S == "number" ? S : [...t.languages].sort(({ lang: e }, { lang: t }) => e - t).filter(({ iso_639_language_code: e }) => e === S)?.[0]?.lang ?? null, w = t;
		else if (w == null) continue;
		else {
			let n = w.languages.find((e) => e.lang === t.lang);
			if (n == null || T !== t.lang) continue;
			let r = d(n.iso_639_language_code, n.TCS, "UNKNOWN");
			if (r == null) continue;
			let [i, a, o] = r, s = a.tokenize(e.data), c = 0, l = Infinity;
			for (let e of s) e.tag === "TimeControlWait" ? c += e.seconds : e.tag === "ClearScreen" && c > 0 && (l = c);
			E.push({
				pts: e.pts,
				duration: l,
				info: {
					association: i,
					language: n.iso_639_language_code
				},
				initialState: o,
				data: s
			});
		}
	}
	for (let e = 0; e < E.length - 1; e++) E[e].duration === Infinity && (E[e].duration = E[e + 1].pts - E[e + 0].pts);
	let D = p.from("layout"), O = p.from("styling"), k = p.from("head");
	k.children.push(D);
	let A = p.from("body"), j = p.from("tt", {
		xmlns: "http://www.w3.org/ns/ttml",
		"xmlns:ttm": "http://www.w3.org/ns/ttml#metadata",
		"xmlns:tts": "http://www.w3.org/ns/ttml#styling",
		"xmlns:ttp": "http://www.w3.org/ns/ttml#parameter",
		"xmlns:itts": "http://www.w3.org/ns/ttml/profile/imsc1#styling",
		"tts:extent": "1920px 1080px",
		"ttp:contentProfiles": "http://www.w3.org/ns/ttml/profile/imsc1.1/image"
	}, [k, A]), M = 0;
	if (y === "canvas") {
		let n = await import("@napi-rs/canvas").catch(() => (console.error("Please install @napi-rs/canvas"), s(-1))), r = t.from({
			font: { normal: x },
			replace: { glyph: C },
			color: {
				stroke: v,
				background: b
			}
		});
		for (let { pts: t, duration: i, data: a, initialState: o, info: s } of E) {
			let c = t, l = c + i;
			if (l === Infinity) continue;
			let u = new e(o, { magnification: 2 }), d = h(c, l, `${M}`, u.parse(a), [1920, 1080], s, r, n);
			if (d == null) continue;
			let { regions: f, styles: p, contents: m } = d;
			A.children.push(...m), D.children.push(...f), O.children.push(...p), M++;
		}
	} else if (y === "svg") {
		let t = r.from({
			font: { normal: x },
			replace: { glyph: C },
			color: {
				stroke: v,
				background: b
			}
		});
		for (let { pts: n, duration: r, data: i, initialState: a, info: o } of E) {
			let s = n, c = s + r;
			if (c === Infinity) continue;
			let l = new e(a, { magnification: 2 }), u = g(s, c, `${M}`, l.parse(i), o, t);
			if (u == null) continue;
			let { regions: d, styles: f, contents: p } = u;
			A.children.push(...p), D.children.push(...d), O.children.push(...f), M++;
		}
	} else return console.error("UnSupported Method: Please Specify canvas or svg"), s(-1);
	f(a, "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + m(j));
})();
//#endregion
