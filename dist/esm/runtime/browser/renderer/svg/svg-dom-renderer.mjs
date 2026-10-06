import { shouldNotAssumeUseClearScreen as e } from "../quirk.mjs";
import { replaceDRCS as t } from "../../types.mjs";
import { SVGRendererOption as n } from "../../../common/renderer/svg/renderer-option.mjs";
import r from "./svg-dom-renderer-strategy.mjs";
//#region src/runtime/browser/renderer/svg/svg-dom-renderer.ts
var i = class {
	option;
	svg;
	constructor(e) {
		this.option = n.from(e), this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"), this.svg.style.position = "absolute", this.svg.style.top = this.svg.style.left = "0", this.svg.style.pointerEvents = "none", this.svg.style.width = "100%", this.svg.style.height = "100%";
	}
	resize(e, t) {}
	destroy() {
		this.clear();
	}
	clear() {
		for (; this.svg.firstChild;) this.svg.removeChild(this.svg.firstChild);
	}
	hide() {
		this.svg.style.visibility = "hidden";
	}
	show() {
		this.svg.style.visibility = "visible";
	}
	render(n, i, a) {
		try {
			e(a) && this.clear(), r(this.svg, n, t(i, this.option.replace.drcs), a, this.option);
		} finally {
			for (let e of i) e.tag === "Bitmap" && (e.normal_bitmap.close(), e.flashing_bitmap?.close());
		}
	}
	onAttach(e) {
		e.appendChild(this.svg);
	}
	onDetach() {
		this.svg.remove();
	}
	onContainerResize(e, t) {
		return !1;
	}
	onVideoResize(e, t) {
		return !1;
	}
	onPlay() {
		this.option.animation.pause && this.svg.unpauseAnimations();
	}
	onPause() {
		this.option.animation.pause && this.svg.pauseAnimations();
	}
	onSeeking() {
		this.clear();
	}
	getPresentationSVGElement() {
		return this.svg;
	}
};
//#endregion
export { i as default };
