import e from "./concat.mjs";
//#region src/util/bytebuilder.ts
var t = class {
	buffers = [];
	build() {
		return e(...this.buffers);
	}
	write(e) {
		this.buffers.push(e);
	}
	writeU8(e) {
		let t = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(1));
		t.setUint8(0, e), this.buffers.push(t.buffer);
	}
	writeU16(e) {
		let t = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(2));
		t.setUint16(0, e, !1), this.buffers.push(t.buffer);
	}
	writeU24(e) {
		let t = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(3));
		t.setUint16(0, (e & 16776960) >> 8, !1), t.setUint8(2, (e & 255) >> 0), this.buffers.push(t.buffer);
	}
	writeU32(e) {
		let t = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(4));
		t.setUint32(0, e, !1), this.buffers.push(t.buffer);
	}
};
//#endregion
export { t as ByteBuilder };
