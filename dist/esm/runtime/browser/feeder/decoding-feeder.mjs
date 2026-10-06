import { ARIBB24ClearScreenToken as e } from "../../../lib/tokenizer/token.mjs";
import { initialState as t } from "../../../lib/parser/parser.mjs";
import { startsNewCaptionPicture as n } from "../renderer/quirk.mjs";
import { FeederOption as r, getTokenizeInformation as i } from "./feeder.mjs";
import a from "../../../util/avl.mjs";
import o from "../../../lib/demuxer/b24/independent/index.mjs";
import s from "../../../lib/demuxer/b24/datagroup.mjs";
import { toBrowserTokenWithBitmap as c } from "../types.mjs";
import l from "../../common/colortable.mjs";
//#region src/runtime/browser/feeder/decoding-feeder.ts
var u = (e, t) => e.length === t.length && e.every((e, n) => e === t[n]), d = .5, f = ({ dts: e }) => e, p = (e, t) => Math.sign(e - t), m = (e, t) => p(e.dts, t.dts) === 0 ? p(e.lang ?? -1, t.lang ?? -1) : p(e.dts, t.dts), h = (e) => {
	for (let t of e.data) t.tag === "Bitmap" && (t.normal_bitmap.close(), t.flashing_bitmap?.close());
}, g = class {
	option;
	priviousTime = null;
	priviousManagementData = null;
	priviousManagementDts = null;
	desiredLang = null;
	decoder = new a(m, p, f);
	managementTimes = new a(p, p, (e) => e);
	replayAfterSeek = !1;
	pendingReplayWindow = !1;
	retainedWindow = null;
	decodedWindowStart = null;
	decoderBuffer = [];
	awaitingManagement = [];
	notified = /* @__PURE__ */ new WeakSet();
	decodingPromise;
	decodingNotify = Promise.resolve;
	abortController = new AbortController();
	present = new a(p, p, (e) => e);
	isDestroyed = !1;
	generation = 0;
	presentationChangeHandler = null;
	presentationChangeQueued = !1;
	changedPresentationPts = /* @__PURE__ */ new Set();
	setPresentationChangeHandler(e) {
		this.presentationChangeHandler = e, e ?? this.changedPresentationPts.clear();
	}
	notifyPresentationChange(e) {
		this.presentationChangeHandler != null && (e !== void 0 && this.changedPresentationPts.add(e), !this.presentationChangeQueued && (this.presentationChangeQueued = !0, queueMicrotask(() => {
			this.presentationChangeQueued = !1;
			let e = [...this.changedPresentationPts];
			this.changedPresentationPts.clear(), this.presentationChangeHandler?.(e);
		})));
	}
	constructor(e) {
		this.option = r.from(e), this.decodingPromise = new Promise((e) => {
			this.decodingNotify = e;
		}), this.pump();
	}
	notify(e) {
		e == null ? (this.decoderBuffer = [], this.abortController.abort(), this.abortController = new AbortController()) : (this.notified.add(e), this.decoderBuffer.push(e)), this.decodingNotify?.();
	}
	async *generator(e) {
		for (;;) {
			if (this.decoderBuffer.length === 0 && (await this.decodingPromise, this.decodingPromise = new Promise((e) => {
				this.decodingNotify = e;
			})), e.aborted) return;
			let t = [...this.decoderBuffer];
			this.decoderBuffer = [];
			for (let n of t) {
				if (e.aborted) return;
				yield n;
			}
		}
	}
	async pump() {
		for (; !this.isDestroyed;) for await (let n of this.generator(this.abortController.signal)) {
			let { pts: r, caption: a } = n;
			if (a.tag === "CaptionManagement") {
				if (this.priviousManagementDts != null && n.key.dts < this.priviousManagementDts || (this.priviousManagementDts = n.key.dts, this.priviousManagementData?.group === a.group)) continue;
				if (typeof this.option.recieve.language == "number") this.desiredLang = this.option.recieve.language;
				else {
					let e = typeof this.option.recieve.language == "string" ? this.option.recieve.language : this.option.recieve.language[0], t = typeof this.option.recieve.language == "string" ? 0 : this.option.recieve.language[1];
					this.desiredLang = [...a.languages].sort(({ lang: e }, { lang: t }) => e - t).filter(({ iso_639_language_code: t }) => t === e)?.[t]?.lang ?? null;
				}
				this.priviousManagementData = a, this.insertPresentation(r, {
					pts: r,
					duration: Infinity,
					state: t,
					info: {
						association: "UNKNOWN",
						language: "und"
					},
					data: [e.from()]
				});
				let i = [];
				for (let e of this.awaitingManagement) e.caption.tag === "CaptionStatement" && e.caption.group === a.group && e.pts >= r ? this.notify(e) : e.caption.group !== a.group && i.push(e);
				this.awaitingManagement = i;
				continue;
			}
			if (this.priviousManagementData == null || this.priviousManagementData.group !== a.group) {
				this.awaitingManagement.push(n);
				continue;
			}
			let o = this.priviousManagementData.languages.find((e) => e.lang === a.lang);
			if (o == null || this.desiredLang !== a.lang) continue;
			let s = i(o.iso_639_language_code, o.TCS, this.option);
			if (s == null) continue;
			let [u, d, f] = s, p = this.generation, m = await c(d.tokenize(a), l);
			if (p !== this.generation || this.isDestroyed) {
				h({
					pts: r,
					duration: 0,
					state: f,
					info: {
						association: u,
						language: o.iso_639_language_code
					},
					data: m
				});
				continue;
			}
			let g = Infinity, _ = 0;
			for (let e of m) if (e.tag === "ClearScreen") {
				if (_ === 0) continue;
				g = _;
			} else e.tag === "TimeControlWait" && (_ += e.seconds);
			this.insertPresentation(r, {
				pts: r,
				duration: g,
				state: f,
				info: {
					association: u,
					language: o.iso_639_language_code
				},
				data: m
			});
		}
	}
	insertPresentation(e, t) {
		let n = this.present.get(e);
		n != null && h(n), this.present.insert(e, t), this.notifyPresentationChange(e);
	}
	feed(e, t, n) {
		let r = o(e);
		if (r == null || r.tag !== this.option.recieve.type) return;
		let i = s(r.data);
		if (i == null) return;
		let a = i.tag === "CaptionStatement" ? i.lang + 1 : 0;
		t += this.option.offset.time, n += this.option.offset.time;
		let c = {
			dts: n,
			lang: a
		}, l = this.decoder.get(c);
		if (l?.pts === t && u(l.packet, e)) {
			!this.notified.has(l) && this.priviousTime !== null && n <= this.priviousTime && this.notify(l);
			return;
		}
		let d = {
			pts: t,
			caption: i,
			key: c,
			packet: e.slice()
		};
		this.decoder.insert(c, d), i.tag === "CaptionManagement" && this.managementTimes.insert(n, n), !this.notified.has(d) && this.priviousTime !== null && n <= this.priviousTime && this.notify(d);
	}
	prepare(e, t) {
		if (this.pendingReplayWindow) return;
		let n = t === void 0 ? e : t;
		if (this.replayAfterSeek && n === null) {
			this.priviousTime = null;
			return;
		}
		if (this.replayAfterSeek && n != null) {
			let t, r;
			for (let n of this.managementTimes.range(-Infinity, e)) {
				let e = this.decoder.get({
					dts: n,
					lang: 0
				});
				e?.caption.tag === "CaptionManagement" && e.caption.group !== r && (t = n, r = e.caption.group);
			}
			let i = this.retainedWindow?.bufferedStart === n ? Math.min(n - d, this.retainedWindow.decodeStart) : n - d, a = t === void 0 ? i : Math.max(t, i);
			if (t !== void 0 && t < a) {
				let e = this.managementTimes.floor(a);
				if (e < a) {
					let t = this.decoder.get({
						dts: e,
						lang: 0
					});
					t != null && this.notify(t);
				}
			}
			this.priviousTime = a, this.decodedWindowStart = a;
		} else this.priviousTime = e, this.decodedWindowStart ??= e;
		this.pendingReplayWindow = this.replayAfterSeek, this.replayAfterSeek = !1;
	}
	content(e, t) {
		if (this.replayAfterSeek && (this.prepare(e, t), this.replayAfterSeek)) return null;
		if (this.priviousTime != null) for (let t of this.decoder.range(this.priviousTime, e)) this.notified.has(t) || this.notify(t);
		return this.pendingReplayWindow = !1, this.priviousTime = e, this.present.floor(e) ?? null;
	}
	clear() {
		this.decoder.clear(), this.managementTimes.clear(), this.retainedWindow = null, this.replayAfterSeek = !1, this.pendingReplayWindow = !1, this.disappearance();
	}
	prune(e) {
		if (!Number.isFinite(e) || this.priviousTime == null || e > this.priviousTime) return;
		let t = e - d;
		if (this.decodedWindowStart == null || t < this.decodedWindowStart) return;
		let r, i;
		for (let e of this.present.range(-Infinity, t)) (r === void 0 || n(e) || i != null && e.pts >= i.pts + i.duration) && (r = e.pts), i = e;
		if (r === void 0 || r < this.decodedWindowStart) return;
		let a = [...this.decoder.range(-Infinity, t)].filter((e) => e.pts < r), o = [...this.decoder.range(-Infinity, t)].filter((e) => e.pts >= r).reduce((e, t) => Math.min(e, t.key.dts), t);
		this.retainedWindow = {
			bufferedStart: e,
			decodeStart: Math.min(r, o)
		};
		let s = this.managementTimes.floor(o);
		for (let e of a) e.key.lang === 0 && e.key.dts === s || (this.decoder.delete(e.key), e.key.lang === 0 && this.managementTimes.delete(e.key.dts));
		for (let e of [...this.present.range(-Infinity, r)]) e.pts !== r && (h(e), this.present.delete(e.pts));
		this.awaitingManagement = this.awaitingManagement.filter((e) => e.pts >= r);
	}
	contentRange(e, t) {
		return e != null && !this.present.has(e) ? null : [...this.present.range(e ?? -Infinity, t)].filter((t) => e == null || t.pts > e);
	}
	disappearance() {
		this.generation++, this.pendingReplayWindow = !1, this.notified = /* @__PURE__ */ new WeakSet(), this.awaitingManagement = [], this.present.forEach(h), this.present.clear(), this.priviousTime = null, this.priviousManagementData = null, this.priviousManagementDts = null, this.decodedWindowStart = null, this.notify(null), this.notifyPresentationChange();
	}
	onAttach() {
		this.disappearance();
	}
	onDetach() {
		this.disappearance();
	}
	onSeeking() {
		this.disappearance(), this.replayAfterSeek = !0;
	}
	destroy() {
		this.isDestroyed = !0, this.presentationChangeHandler = null, this.clear();
	}
};
//#endregion
export { d as SEEK_BUFFER_PREROLL_SECONDS, g as default };
