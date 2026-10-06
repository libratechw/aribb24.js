import { ARIBB24FlashingControlType as e } from "../../../../lib/tokenizer/token.mjs";
import { ExhaustivenessError as t } from "../../../../util/error.mjs";
import { ARIBB24BitmapParsedToken as n, ARIBB24Parser as r } from "../../../../lib/parser/parser.mjs";
import { shouldHalfWidth as i } from "../../quirk.mjs";
import a from "../../colortable.mjs";
import o from "../../halfwidth.mjs";
import s from "../../namedcolor.mjs";
import c from "../../font.mjs";
//#region src/runtime/common/renderer/svg/renderer-strategy.ts
var l = { from(e, t, n = {}, r = []) {
	return {
		name: t,
		xmlns: e,
		attributes: n,
		children: r
	};
} }, u = (e, t = 0) => {
	if (typeof e == "string") return "  ".repeat(t) + e + "\n";
	let n = Array.from([...e.name === "svg" ? [["xmlns", e.xmlns]] : [], ...Object.entries(e.attributes)]).map(([e, t]) => `${e}="${t}"`).join(" "), r = "  ".repeat(t) + `<${e.name}${n === "" ? "" : " " + n}${e.children.length === 0 ? " /" : ""}>\n`;
	if (e.children.length === 0) return r;
	for (let n of e.children) r += u(n, t + 1);
	return r += "  ".repeat(t) + `</${e.name}>\n`, r;
}, d = (e, r, i, o) => {
	let s = l.from("http://www.w3.org/2000/svg", "svg"), c = l.from("http://www.w3.org/2000/svg", "svg"), u = [], d = [], _ = /* @__PURE__ */ new Map();
	for (let o of e) switch (s.attributes.viewBox = `0 0 ${o.state.plane[0]} ${o.state.plane[1]}`, c.attributes.viewBox = `0 0 ${o.state.area[0]} ${o.state.area[1]}`, c.attributes.x = `${o.state.margin[0]}`, c.attributes.y = `${o.state.margin[1]}`, c.attributes.width = `${o.state.area[0]}`, c.attributes.height = `${o.state.area[1]}`, o.tag) {
		case "Character": {
			if (!o.non_spacing) {
				let [e, t] = m(o, r, i);
				_.set(e, `${_.get(e) ?? ""}${_.has(e) ? " " : ""}${t}`);
			}
			let e = l.from("http://www.w3.org/2000/svg", "g");
			e.children.push(h(o, r, i)), e.children.push(f(o, r, i));
			let t = p(o, r, i);
			t && e.children.push(t), u.push(e);
			break;
		}
		case "DRCS": {
			let [e, t] = m(o, r, i);
			_.set(e, `${_.get(e) ?? ""}${_.has(e) ? " " : ""}${t}`);
			let n = l.from("http://www.w3.org/2000/svg", "g");
			for (let e of g(o, r, i)) n.children.push(e);
			n.children.push(f(o, r, i));
			let a = p(o, r, i);
			a && n.children.push(a), u.push(n);
			break;
		}
		case "Bitmap": {
			let { width: e, height: t, normal_dataurl: r, flashing_dataurl: i } = n.toDataURL(o, a);
			{
				let n = l.from("http://www.w3.org/2000/svg", "image");
				n.attributes.href = r, n.attributes.x = `${o.x_position}`, n.attributes.y = `${o.y_position}`, n.attributes.width = `${e}`, n.attributes.height = `${t}`, d.push(n);
			}
			if (i != null) {
				let n = l.from("http://www.w3.org/2000/svg", "image");
				n.attributes.href = i, n.attributes.x = `${o.x_position}`, n.attributes.y = `${o.y_position}`, n.attributes.width = `${e}`, n.attributes.height = `${t}`;
				let r = l.from("http://www.w3.org/2000/svg", "animate");
				r.attributes.attributeName = "opacity", r.attributes.values = "1;0", r.attributes.dur = "1s", r.attributes.calcMode = "discrete", r.attributes.repeatCount = "indefinite", n.children.push(r), d.push(n);
			}
			break;
		}
		case "ClearScreen":
			if (o.time === 0) {
				c.children = [];
				break;
			}
			break;
		default: throw new t(o, "Unexpected ARIB Parsed Token in SVGRenderingStrategy");
	}
	for (let [e, t] of _.entries()) {
		let n = l.from("http://www.w3.org/2000/svg", "path");
		n.attributes["shape-rendering"] = "crispEdges", n.attributes.d = t, n.attributes.fill = e, c.children.push(n);
	}
	return c.children.push(...u), c.children.push(...d), o ? (s.children.push(c), s) : c;
}, f = (e, t, n) => {
	let { state: i, option: o } = e, s = n.color.foreground ?? a[i.foreground], c = i.position[0] + 0 + 0, u = i.position[1] + 1 - r.box(i)[1], d = "";
	i.highlight & 1 && (d += (d === "" ? "" : " ") + `M ${c} ${u + r.box(i)[1] - 1 * o.magnification} h ${r.box(i)[0]} v ${o.magnification} H ${c} Z`), i.highlight & 2 && (d += (d === "" ? "" : " ") + `M ${c + r.box(i)[0] - 1 * o.magnification} ${u} h ${o.magnification} v ${r.box(i)[1]} H ${c + r.box(i)[0] - 1 * o.magnification} Z`), i.highlight & 4 && (d += (d === "" ? "" : " ") + `M ${c} ${u} h ${r.box(i)[0]} v ${o.magnification} H ${c} Z`), i.highlight & 8 && (d += (d === "" ? "" : " ") + `M ${c} ${u} h ${o.magnification} v ${r.box(i)[1]} H ${c} Z`), i.underline && (d += (d === "" ? "" : " ") + `M ${c} ${u + r.box(i)[1] - 1 * o.magnification} h ${r.box(i)[0]} v ${o.magnification} H ${c} Z`);
	let f = l.from("http://www.w3.org/2000/svg", "path");
	return f.attributes["shape-rendering"] = "crispEdges", d !== "" && (f.attributes.d = d), f.attributes.fill = s, f;
}, p = (n, r, i) => {
	let { state: a } = n;
	switch (a.flashing) {
		case e.STOP: return null;
		case e.NORMAL:
		case e.INVERTED: {
			let t = l.from("http://www.w3.org/2000/svg", "animate");
			return t.attributes.attributeName = "opacity", t.attributes.values = a.flashing === e.NORMAL ? "1;0" : "0;1", t.attributes.dur = "1s", t.attributes.calcMode = "discrete", t.attributes.repeatCount = "indefinite", t;
		}
		default: throw new t(a.flashing, "Unhandled Flasing Token in SVGDOMRenderingStrategy");
	}
}, m = (e, t, n) => {
	let { state: i } = e, o = n.color.background ?? a[i.background], s = Math.floor(i.position[0] + 0 + 0);
	return [o, `M ${s} ${Math.floor(i.position[1] + 1 - r.box(i)[1])} h ${r.box(i)[0]} v ${r.box(i)[1]} H ${s} Z`];
}, h = (e, t, n) => {
	let { state: u, option: d, character: f } = e, p = i(u.size, t), m = n.replace.half && p, h = o.has(f), g = m && h ? o.get(f) : f, _ = Math.floor(u.position[0] + 0 + r.box(u)[0] / 2), v = Math.floor(u.position[1] + 1 - r.box(u)[1] / 2), y = r.scale(u)[0], b = r.scale(u)[1], x = (n.color.stroke == null ? null : s.get(n.color.stroke) ?? n.color.stroke) ?? (u.ornament == null ? null : a[u.ornament]), S = n.color.foreground ?? a[u.foreground], C = l.from("http://www.w3.org/2000/svg", "text");
	return C.attributes.x = `${_}`, C.attributes.y = `${v}`, C.attributes.transform = `scale(1 ${b})`, C.attributes["transform-origin"] = `${_} ${v}`, C.attributes["font-size"] = `${u.fontsize[0]}`, C.attributes["font-family"] = c(g) ? n.font.arib ?? n.font.normal : n.font.normal, C.attributes["dominant-baseline"] = "central", C.attributes["text-anchor"] = "middle", C.attributes.fill = S, C.attributes["paint-order"] = "stroke", C.attributes["stroke-linejoin"] = "round", C.attributes["stroke-width"] = x == null ? "0" : `${4 * d.magnification}`, C.attributes.stroke = x ?? "transparent", C.attributes["data-width"] = `${u.fontsize[0] * y}`, C.attributes.textLength = `${u.fontsize[0] * y}`, C.attributes.lengthAdjust = "spacingAndGlyphs", C.children.push(g), C;
}, g = (e, t, n) => {
	let { state: i, option: o, width: c, height: u, depth: d, binary: f } = e, p = new Uint8Array(f), m = (n.color.stroke == null ? null : s.get(n.color.stroke) ?? n.color.stroke) ?? (i.ornament == null ? null : a[i.ornament]), h = n.color.foreground ?? a[i.foreground], g = i.position[0] + (0 + r.offset(i)[0]), _ = i.position[1] + (1 - r.box(i)[1] + r.offset(i)[1]), v = "";
	for (let e = 0; e < u; e++) for (let t = 0; t < c; t++) {
		let n = g + t * o.magnification, r = _ + e * o.magnification, i = 0;
		for (let n = 0; n < d; n++) {
			let r = Math.floor(((e * c + t) * d + n) / 8), a = 7 - ((e * c + t) * d + n) % 8;
			i *= 2, i += (p[r] & 1 << a) >> a;
		}
		i !== 0 && (v += (v === "" ? "" : " ") + `M ${n} ${r} h ${o.magnification} v ${o.magnification} H ${n} Z`);
	}
	let y = l.from("http://www.w3.org/2000/svg", "path"), b = l.from("http://www.w3.org/2000/svg", "path");
	return y.attributes["shape-rendering"] = "crispEdges", b.attributes["shape-rendering"] = "crispEdges", y.attributes.d = v, b.attributes.d = v, y.attributes.stroke = m ?? "transparent", b.attributes.stroke = "transparent", y.attributes.fill = "transparent", b.attributes.fill = h, y.attributes["stroke-width"] = m == null ? "0" : `${4 * o.magnification}`, y.attributes["stroke-linejoin"] = "round", [y, b];
};
//#endregion
export { l as SVGNode, d as default, u as serializeSVG };
