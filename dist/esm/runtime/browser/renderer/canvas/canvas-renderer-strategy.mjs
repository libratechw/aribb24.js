import { ExhaustivenessError as e } from "../../../../util/error.mjs";
import { ARIBB24BrowserParser as t } from "../../types.mjs";
import { renderCharacter as n, renderDRCS as r } from "../../../common/renderer/canvas/renderer-strategy.mjs";
//#region src/runtime/browser/renderer/canvas/canvas-renderer-strategy.ts
var i = (e, t, n, r, i, o) => {
	try {
		a(e, t, n, r, i, o);
	} finally {
		for (let e of r) e.tag === "Bitmap" && (e.normal_bitmap.close(), e.flashing_bitmap?.close());
	}
}, a = (i, a, s, c, l, u) => {
	let d = [1, 1];
	{
		let f = a.getContext("2d");
		if (f == null) return;
		let p = new t(s), m = p.parse(c), { plane: h } = p.currentState();
		i != null && (d = [Math.ceil(i.width / h[0]), Math.ceil(i.height / h[1])]);
		let g = h[0] * d[0], _ = h[1] * d[1];
		(a.width !== g || a.height !== _) && (a.width = g, a.height = _, f.clearRect(0, 0, a.width, a.height));
		for (let t of m) switch (t.tag) {
			case "Character":
				n(f, t, globalThis.Path2D, d, l, u);
				break;
			case "DRCS":
				r(f, t, globalThis.Path2D, d, l, u);
				break;
			case "Bitmap":
				o(f, t, globalThis.Path2D, d, l, u);
				break;
			case "ClearScreen":
				t.time === 0 && f.clearRect(0, 0, a.width, a.height);
				break;
			default: throw new e(t, "Unhandled ARIB Parsed Token in CanvasRendererStrategy");
		}
	}
	if (i != null) {
		let e = i.getContext("2d");
		if (e == null) return;
		switch (e.clearRect(0, 0, i.width, i.height), u.resize.objectFit) {
			case "none":
				e.drawImage(a, 0, 0, i.width, i.height);
				break;
			default: {
				let t = i.width / (a.width / d[0]), n = i.height / (a.height / d[1]), r = Math.min(t, n), o = a.width * r / d[0], s = a.height * r / d[1], c = (i.width - o) / 2, l = (i.height - s) / 2;
				e.drawImage(a, 0, 0, a.width, a.height, c, l, o, s);
				break;
			}
		}
	}
}, o = (e, t, n, r, i, a) => {
	let { x_position: o, y_position: s, width: c, height: l } = t;
	e.drawImage(t.normal_bitmap, o * r[0], s * r[1], c * r[0], l * r[1]);
};
//#endregion
export { i as default };
