import { ExhaustivenessError as e } from "../../../../util/error.mjs";
//#region src/lib/muxer/b24/independent/index.ts
var t = (t) => {
	let n = new Uint8Array(3 + t.data.byteLength);
	switch (t.tag) {
		case "Caption": return n[0] = 128, n[1] = 255, n[2] = 0, n.set(new Uint8Array(t.data), 3), n.buffer;
		case "Superimpose": return n[0] = 129, n[1] = 255, n[2] = 0, n.set(new Uint8Array(t.data), 3), n.buffer;
		default: throw new e(t, "Unexpected ARIB Caption Type");
	}
};
//#endregion
export { t as default };
