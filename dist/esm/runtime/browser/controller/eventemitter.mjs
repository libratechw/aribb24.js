//#region src/runtime/browser/controller/eventemitter.ts
var e = class {
	listeners = /* @__PURE__ */ new Map();
	on(e, t) {
		this.listeners.has(e) || this.listeners.set(e, []), this.listeners.get(e).push(t);
	}
	off(e, t) {
		this.listeners.has(e) && this.listeners.set(e, this.listeners.get(e).filter((e) => e !== t));
	}
	emit(e, t) {
		(this.listeners.get(e) ?? []).forEach((e) => {
			e(t);
		});
	}
};
//#endregion
export { e as default };
