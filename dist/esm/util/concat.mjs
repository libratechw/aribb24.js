//#region src/util/concat.ts
var e = (...e) => {
	if (!e) return /* @__PURE__ */ new ArrayBuffer(0);
	let t = e.reduce((e, t) => e + t.byteLength, 0), n = new Uint8Array(t);
	for (let t = 0, r = 0; t < e.length; r += e[t].byteLength, t++) n.set(new Uint8Array(e[t]), r);
	return n.buffer;
};
//#endregion
export { e as default };
