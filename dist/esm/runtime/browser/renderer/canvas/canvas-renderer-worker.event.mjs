//#region src/runtime/browser/renderer/canvas/canvas-renderer-worker.event.ts
var e = { from(e, t) {
	return {
		type: "initialize",
		present: e,
		buffer: t
	};
} }, t = { from() {
	return { type: "clear" };
} }, n = { from(e, t) {
	return {
		type: "resize",
		width: e,
		height: t
	};
} }, r = { from(e, t, n, r) {
	return {
		type: "render",
		state: e,
		tokens: t,
		info: n,
		option: r
	};
} }, i = { from(e) {
	return {
		type: "imagebitmap",
		bitmap: e ?? null
	};
} };
//#endregion
export { t as FromMainToWorkerEventClear, e as FromMainToWorkerEventInitialize, r as FromMainToWorkerEventRender, n as FromMainToWorkerEventResize, i as FromWorkerToMainEventImageBitmap };
