import { replaceDRCS as e } from "../../types.mjs";
import t from "./canvas-renderer.mjs";
import n from "./canvas-renderer-strategy.mjs";
//#region src/runtime/browser/renderer/canvas/canvas-renderer-mainthread.ts
var r = class extends t {
	buffer;
	constructor(e) {
		super(e), this.buffer = document.createElement("canvas");
	}
	resize(e, t) {
		this.canvas.width = e, this.canvas.height = t;
	}
	destroy() {
		this.resize(0, 0), this.buffer.width = this.buffer.height = 0;
	}
	clear() {
		{
			let e = this.buffer.getContext("2d");
			if (e == null) return;
			e.clearRect(0, 0, this.buffer.width, this.buffer.height);
		}
		{
			let e = this.canvas.getContext("2d");
			if (e == null) return;
			e.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
	}
	render(t, r, i) {
		n(this.canvas, this.buffer, t, e(r, this.option.replace.drcs), i, this.option);
	}
	getPresentationCanvas() {
		return this.canvas;
	}
};
//#endregion
export { r as default };
