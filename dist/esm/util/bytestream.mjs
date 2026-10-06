import { EOFError as e } from "./error.mjs";
//#region src/util/bytestream.ts
var t = class {
	data;
	view;
	offset;
	constructor(e) {
		this.data = e, this.view = new DataView(e.buffer, e.byteOffset, e.byteLength), this.offset = 0;
	}
	exists(e) {
		return this.offset + e <= this.view.byteLength;
	}
	isEmpty() {
		return this.offset === this.view.byteLength;
	}
	read(t) {
		if (!this.exists(t)) throw new e("Detected EOF!");
		let n = this.data.subarray(this.offset, this.offset + t);
		return this.offset += t, n;
	}
	peekU8() {
		if (!this.exists(1)) throw new e("Detected EOF!");
		return this.view.getUint8(this.offset);
	}
	readU8() {
		let e = this.peekU8();
		return this.offset += 1, e;
	}
	peekU16() {
		if (!this.exists(2)) throw new e("Detected EOF!");
		return this.view.getUint16(this.offset, !1);
	}
	readU16() {
		let e = this.peekU16();
		return this.offset += 2, e;
	}
	peekU24() {
		if (!this.exists(3)) throw new e("Detected EOF!");
		return this.view.getUint16(this.offset, !1) * 2 ** 8 + this.view.getUint8(this.offset + 2);
	}
	readU24() {
		let e = this.peekU24();
		return this.offset += 3, e;
	}
	peekU32() {
		if (!this.exists(4)) throw new e("Detected EOF!");
		return this.view.getUint32(this.offset, !1);
	}
	readU32() {
		let e = this.peekU32();
		return this.offset += 4, e;
	}
	readAll() {
		let e = this.data.subarray(this.offset);
		return this.offset = this.view.byteLength, e;
	}
};
//#endregion
export { t as ByteStream };
