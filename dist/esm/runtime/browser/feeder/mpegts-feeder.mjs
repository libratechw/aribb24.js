import { base64ToUint8Array as e } from "../../../util/binary.mjs";
import { parseID3v2 as t } from "../../../util/id3.mjs";
import n from "./decoding-feeder.mjs";
//#region src/runtime/browser/feeder/mpegts-feeder.ts
var r = class extends n {
	constructor(e) {
		super(e);
	}
	feedB24(e, t, n) {
		e = e instanceof Uint8Array ? e : new Uint8Array(e), this.feed(e, t, n ?? t);
	}
	feedID3(n, r, i) {
		n = n instanceof Uint8Array ? n : new Uint8Array(n);
		for (let a of t(n)) switch (a.id) {
			case "PRIV":
				if (a.owner !== "aribb24.js") break;
				this.feed(a.data, r, i ?? r);
				break;
			case "TXXX":
				if (a.description !== "aribb24.js") break;
				this.feed(e(a.text), r, i ?? r);
				break;
		}
	}
};
//#endregion
export { r as default };
