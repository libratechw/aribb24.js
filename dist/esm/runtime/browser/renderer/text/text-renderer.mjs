import { ExhaustivenessError as e } from "../../../../util/error.mjs";
import { shouldHalfWidth as t } from "../../../common/quirk.mjs";
import { shouldIgnoreSmallAsRuby as n, shouldNotAssumeUseClearScreen as r, shouldRemoveTransparentSpace as i } from "../quirk.mjs";
import { ARIBB24BrowserParser as a, replaceDRCS as o } from "../../types.mjs";
import { TextRendererOption as s } from "./text-renderer-option.mjs";
import c from "../halftext.mjs";
//#region src/runtime/browser/renderer/text/text-renderer.ts
var l = class {
	option;
	text = null;
	constructor(e) {
		this.option = s.from(e);
	}
	getText() {
		return this.text;
	}
	resize(e, t) {}
	destroy() {
		this.text = null;
	}
	clear() {
		this.text = null;
	}
	hide() {}
	show() {}
	render(s, l, u) {
		(r(u) || this.text == null && l.some((e) => e.tag === "Character" || e.tag === "DRCS")) && (this.text = "");
		let d = null, f = new a(s);
		for (let r of f.parse(o(l, this.option.replace.drcs))) switch (r.tag) {
			case "Character": {
				let { state: e, character: a } = r;
				if (this.text == null || (a === " " || a === "　") && e.background === 8 && i(u) || n(e.size, u)) break;
				d != null && e.position[1] !== d && (this.text += "\n"), d = e.position[1], this.option.replace.half && t(e.size, u) ? this.text += c.get(a) : this.text += a;
				break;
			}
			case "DRCS": {
				let { state: e } = r;
				if (this.text == null) break;
				d != null && e.position[1] !== d && (this.text += "\n"), d = e.position[1], this.text += "〓";
				break;
			}
			case "Bitmap":
				r.normal_bitmap.close(), r.flashing_bitmap?.close();
				break;
			case "ClearScreen":
				r.time === 0 && (this.text = "");
				break;
			default: throw new e(r, "Unexpected ARIB Parsed Token in TextRenderer");
		}
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
};
//#endregion
export { l as default };
