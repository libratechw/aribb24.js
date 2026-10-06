import { ExhaustivenessError as e } from "../../../../util/error.mjs";
import { shouldHalfWidth as t } from "../../../common/quirk.mjs";
import { shouldNotAssumeUseClearScreen as n } from "../quirk.mjs";
import { SSZ_RUBY_DETECTION as r } from "../../../../lib/parser/regioner.mjs";
import { ARIBB24BrowserParser as i, makeRegions as a, replaceDRCS as o } from "../../types.mjs";
import s from "../../../common/colortable.mjs";
import c from "../halftext.mjs";
import { HTMLFragmentRendererOption as l } from "./html-fragment-renderer-option.mjs";
//#region src/runtime/browser/renderer/html/html-fragment-renderer.ts
var u = (e, n, r) => {
	switch (e.tag) {
		case "Character": {
			let i = document.createElement("div");
			return i.style.display = "inline-block", i.style.whiteSpace = "pre", r.color.foreground && (i.style.color = s[e.state.foreground]), r.color.stroke && (i.style.webkitTextStroke = "0.1em black", i.style.paintOrder = "stroke fill"), i.textContent = t(e.state.size, n) && c.get(e.character) || e.character, i;
		}
		case "DRCS": {
			let t = document.createElementNS("http://www.w3.org/2000/svg", "svg"), { state: n, width: i, height: a, depth: o, binary: c } = e, l = new Uint8Array(c), u = s[n.foreground], d = "";
			for (let e = 0; e < a; e++) for (let t = 0; t < i; t++) {
				let n = 0;
				for (let r = 0; r < o; r++) {
					let a = Math.floor(((e * i + t) * o + r) / 8), s = 7 - ((e * i + t) * o + r) % 8;
					n *= 2, n += (l[a] & 1 << s) >> s;
				}
				n !== 0 && (d += (d === "" ? "" : " ") + `M ${t} ${e} h 1 v 1 H ${t} Z`);
			}
			let f = document.createElementNS("http://www.w3.org/2000/svg", "path");
			if (r.color.stroke) {
				let e = document.createElementNS("http://www.w3.org/2000/svg", "path");
				e.setAttribute("d", d), e.setAttribute("stroke", "black"), e.setAttribute("fill", "transparent"), e.setAttribute("stroke-width", "2"), e.setAttribute("stroke-linejoin", "round"), t.appendChild(e);
			}
			return f.setAttribute("shape-rendering", "crispEdges"), f.setAttribute("d", d), f.setAttribute("stroke", "transparent"), f.setAttribute("fill", u), t.appendChild(f), t.setAttribute("viewBox", `0 0 ${i} ${a}`), t.style.width = "1em", t.style.verticalAlign = "middle", t;
		}
		case "Script":
			let i = document.createElement("div");
			return i.style.display = "inline-flex", i.style.fontSize = "0.5em", i.style.flexDirection = "column", i.style.verticalAlign = "top", i.appendChild(u(e.sup, n, r)), i.appendChild(u(e.sub, n, r)), i;
	}
}, d = class {
	option;
	element;
	constructor(e) {
		this.option = l.from(e), this.element = document.createElement("div");
	}
	resize(e, t) {}
	destroy() {
		for (; this.element.firstChild;) this.element.removeChild(this.element.firstChild);
	}
	clear() {
		for (; this.element.firstChild;) this.element.removeChild(this.element.firstChild);
	}
	hide() {
		this.element.style.visibility = "hidden";
	}
	show() {
		this.element.style.visibility = "showing";
	}
	render(t, s, c) {
		n(c) && this.clear();
		let l = new i(t), d = new DocumentFragment(), f = a(l.parse(o(s, this.option.replace.drcs)), c, r.GUESS).map((t) => {
			let n = document.createElement("div");
			n.style.display = "inline-block", t.highlight && (n.style.border = "1px solid white");
			for (let r of t.spans) {
				let t = document.createElement("div");
				switch (t.style.display = "inline-block", r.tag) {
					case "Normal":
						for (let e of r.text) t.appendChild(u(e, c, this.option));
						break;
					case "Ruby": {
						let e = document.createElement("span");
						for (let t of r.ruby) e.appendChild(u(t, c, this.option));
						let n = document.createElement("rt");
						n.append(e);
						let i = document.createElement("span");
						for (let e of r.text) i.appendChild(u(e, c, this.option));
						let a = document.createElement("ruby");
						a.appendChild(i), a.appendChild(n), t.appendChild(a);
						break;
					}
					default: throw new e(r, "Undefined Region Type in HTMLFragmentRenderer");
				}
				n.appendChild(t);
			}
			return n;
		});
		for (let e of f.slice(0, -1)) e.style.marginRight = "0.5em";
		for (let e of f) d.appendChild(e);
		this.clear(), this.element.appendChild(d);
	}
	onAttach(e) {}
	onDetach() {}
	onContainerResize(e, t) {
		return !1;
	}
	onVideoResize(e, t) {
		return !1;
	}
	onPlay() {}
	onPause() {}
	onSeeking() {
		this.clear();
	}
	getPresentationElement() {
		return this.element;
	}
};
//#endregion
export { d as default };
