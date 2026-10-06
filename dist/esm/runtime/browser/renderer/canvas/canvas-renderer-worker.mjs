import { replaceDRCS as e } from "../../types.mjs";
import t from "./canvas-renderer.mjs";
import n from "./canvas-renderer-worker.worker.mjs";
import { FromMainToWorkerEventClear as r, FromMainToWorkerEventInitialize as i, FromMainToWorkerEventRender as a, FromMainToWorkerEventResize as o, FromWorkerToMainEventImageBitmap as s } from "./canvas-renderer-worker.event.mjs";
//#region src/runtime/browser/renderer/canvas/canvas-renderer-worker.ts
var c = class extends t {
	buffer;
	present;
	worker;
	failed = !1;
	destroyed = !1;
	waitPromise = null;
	waitResolve = () => {};
	bitmapResolve = null;
	constructor(e, t) {
		super(e), this.onFailure = t, this.present = this.canvas.transferControlToOffscreen(), this.buffer = new OffscreenCanvas(0, 0), this.worker = new n(), this.worker.addEventListener("message", this.onWorkerMessage), this.worker.addEventListener("error", this.onWorkerError), this.worker.addEventListener("messageerror", this.onWorkerMessageError);
		try {
			this.worker.postMessage(i.from(this.present, this.buffer), [this.present, this.buffer]);
		} catch (e) {
			throw this.destroy(), e;
		}
	}
	onWorkerMessage = (e) => {
		switch (e.data.type) {
			case "imagebitmap":
				this.bitmapResolve == null ? e.data.bitmap?.close() : this.settleBitmap(e.data.bitmap);
				break;
			case "error":
				this.fail(Error(e.data.message));
				break;
			case "render-error":
				console.error("[aribb24.js] Caption rendering failed:", e.data.message);
				break;
		}
	};
	onWorkerError = (e) => {
		this.fail(e.error instanceof Error ? e.error : Error(e.message || "ARIB caption Worker failed."));
	};
	onWorkerMessageError = () => {
		this.fail(/* @__PURE__ */ Error("ARIB caption Worker message could not be decoded."));
	};
	settleBitmap(e) {
		let t = this.bitmapResolve;
		this.bitmapResolve = null, t?.(e), this.waitResolve();
	}
	fail(e) {
		this.failed || this.destroyed || (this.failed = !0, this.worker.terminate(), this.settleBitmap(null), queueMicrotask(() => {
			this.destroyed || (this.onFailure ? this.onFailure(e) : console.error("[aribb24.js] Caption Worker failed:", e));
		}));
	}
	resize(e, t) {
		if (!(this.failed || this.destroyed)) try {
			this.worker.postMessage(o.from(e, t));
		} catch (e) {
			this.fail(e instanceof Error ? e : Error(String(e)));
		}
	}
	destroy() {
		this.destroyed || (this.destroyed = !0, this.worker.terminate(), this.settleBitmap(null));
	}
	clear() {
		if (!(this.failed || this.destroyed)) try {
			this.worker.postMessage(r.from());
		} catch (e) {
			this.fail(e instanceof Error ? e : Error(String(e)));
		}
	}
	render(t, n, r) {
		let i = [...new Set(n.flatMap((e) => e.tag === "Bitmap" ? [e.normal_bitmap, e.flashing_bitmap].filter((e) => e != null) : []))];
		if (this.failed || this.destroyed) {
			i.forEach((e) => e.close());
			return;
		}
		try {
			let o = e(n, this.option.replace.drcs);
			this.worker.postMessage(a.from(t, o, r, this.option), i);
		} catch (e) {
			i.forEach((e) => e.close()), this.fail(e instanceof Error ? e : Error(String(e)));
		}
	}
	async getPresentationImageBitmap() {
		if (this.failed || this.destroyed) return null;
		for (; this.waitPromise != null;) if (await this.waitPromise, this.failed || this.destroyed) return null;
		this.waitPromise = new Promise((e) => {
			this.waitResolve = () => {
				this.waitPromise = null, this.waitResolve = () => {}, e();
			};
		});
		let e = new Promise((e) => {
			this.bitmapResolve = e;
		});
		try {
			this.worker.postMessage(s.from());
		} catch (e) {
			this.fail(e instanceof Error ? e : Error(String(e)));
		}
		return e;
	}
};
//#endregion
export { c as default };
