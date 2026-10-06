import { ARIBB24BrowserParser as e } from "../../types.mjs";
import t, { SVGNode as n } from "../../../common/renderer/svg/renderer-strategy.mjs";
//#region src/runtime/browser/renderer/svg/svg-dom-renderer-strategy.ts
var r = (e) => {
	if (typeof e == "string") return document.createTextNode(e);
	let t = document.createElementNS(e.xmlns, e.name);
	for (let [n, r] of Object.entries(e.attributes)) t.setAttribute(n, r);
	for (let n of e.children) t.appendChild(r(n));
	return t;
}, i = (i, a, o, s, c) => {
	let l = new e(a), u = l.parse(o), d = u.filter((e) => e.tag !== "Bitmap"), f = u.filter((e) => e.tag === "Bitmap"), p = u.find((e) => e.tag === "ClearScreen");
	if (p && p.time === 0) for (; i.lastChild != null;) i.removeChild(i.lastChild);
	let m = t(d, s, c);
	for (let e of f) {
		{
			let t = n.from("http://www.w3.org/2000/svg", "image");
			t.attributes.href = e.normal_dataurl, t.attributes.x = `${e.x_position}`, t.attributes.y = `${e.y_position}`, t.attributes.width = `${e.width}`, t.attributes.height = `${e.height}`, m.children.push(t);
		}
		if (e.flashing_dataurl != null) {
			let t = n.from("http://www.w3.org/2000/svg", "image");
			t.attributes.href = e.flashing_dataurl, t.attributes.x = `${e.x_position}`, t.attributes.y = `${e.y_position}`, t.attributes.width = `${e.width}`, t.attributes.height = `${e.height}`;
			let r = n.from("http://www.w3.org/2000/svg", "animate");
			r.attributes.attributeName = "opacity", r.attributes.values = "1;0", r.attributes.dur = "1s", r.attributes.calcMode = "discrete", r.attributes.repeatCount = "indefinite", t.children.push(r), m.children.push(t);
		}
	}
	let h = r(m);
	h.style.visibility = "hidden", i.setAttribute("viewBox", `0 0 ${l.currentState().plane[0]} ${l.currentState().plane[1]}`), i.appendChild(h);
	for (let e of Array.from(i.getElementsByTagNameNS("http://www.w3.org/2000/svg", "text"))) {
		let t = e.getComputedTextLength();
		e.setAttribute("textLength", `${Math.min(t, Number.parseInt(e.dataset.width, 10))}`), delete e.dataset.width, e.setAttribute("lengthAdjust", "spacingAndGlyphs");
	}
	for (let e of Array.from(i.getElementsByTagNameNS("http://www.w3.org/2000/svg", "animate"))) e.beginElement();
	h.style.visibility = "visible";
};
//#endregion
export { i as default };
