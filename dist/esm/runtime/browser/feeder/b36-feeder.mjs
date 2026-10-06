import { FeederOption as e, getTokenizeInformation as t } from "./feeder.mjs";
import { toBrowserTokenWithoutBitmap as n } from "../types.mjs";
import r from "../../../lib/demuxer/b36/index.mjs";
//#region src/runtime/browser/feeder/b36-feeder.ts
var i = class {
	option;
	captions;
	constructor(i, a) {
		i = i instanceof Uint8Array ? i : new Uint8Array(i), this.option = e.from(a);
		let { initialTime: o, pages: s } = r(i);
		this.captions = s.filter((e) => e.tag === "ActualPage").flatMap((e) => {
			let r = e.displayTiming - o + this.option.offset.time, i = e.clearTiming - o + this.option.offset.time - r, a = e.statement, s = e.management.languages.find((e) => e.lang === a.lang);
			if (s == null) return [];
			let c = t(s.iso_639_language_code, s.TCS, this.option);
			if (c == null) return [];
			let [l, u, d] = c, f = n(u.tokenize(a));
			return [{
				pts: r,
				duration: i,
				state: d,
				info: {
					association: l,
					language: s.iso_639_language_code
				},
				data: f
			}];
		});
	}
	prepare(e) {}
	content(e) {
		{
			let t = this.captions[0];
			if (!t || e < t.pts) return null;
		}
		let t = 0, n = this.captions.length;
		for (; t + 1 < n;) {
			let r = Math.floor((t + n) / 2);
			this.captions[r].pts <= e ? t = r : n = r;
		}
		return this.captions[t] ?? null;
	}
	clear() {
		this.captions = [];
	}
	onAttach() {}
	onDetach() {}
	onSeeking() {}
	destroy() {
		this.clear();
	}
};
//#endregion
export { i as default };
