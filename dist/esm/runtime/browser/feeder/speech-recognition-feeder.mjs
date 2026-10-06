import { ARIBB24ActivePositionReturnToken as e, ARIBB24ActivePositionSetToken as t, ARIBB24CharacterCompositionDotDesignationToken as n, ARIBB24CharacterToken as r, ARIBB24ClearScreenToken as i, ARIBB24ColorControlBackgroundToken as a, ARIBB24MiddleSizeToken as o, ARIBB24NormalSizeToken as s, ARIBB24PalletControlToken as c, ARIBB24SetDisplayFormatToken as l, ARIBB24SetDisplayPositionToken as u, ARIBB24SetHorizontalSpacingToken as d, ARIBB24SetVerticalSpacingToken as f, ARIBB24SetWritingFormatToken as p, ARIBB24WhiteForegroundToken as m } from "../../../lib/tokenizer/token.mjs";
import h from "../../../lib/parser/state/ARIB.mjs";
//#region src/runtime/browser/feeder/speech-recognition-feeder.ts
var g = class {
	media = null;
	track = null;
	recognition;
	recognitionTime = null;
	interim = "";
	privious = "";
	endedHandler = this.capture.bind(this);
	clearHandler = this.clear.bind(this);
	recognitionEndHandler = this.recognitionEnd.bind(this);
	recognitionResultHandler = this.recognitionResult.bind(this);
	constructor(e = "ja-JP") {
		this.recognition = new (globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition)(), this.recognition.lang = e, this.recognition.interimResults = !0, this.recognition.mode = "ondevice-only", this.recognition.addEventListener("end", this.recognitionEndHandler), this.recognition.addEventListener("error", this.clearHandler), this.recognition.addEventListener("result", this.recognitionResultHandler);
	}
	attachMedia(e) {
		this.detachMedia(), this.media = e, this.media.addEventListener("ended", this.endedHandler), this.media.readyState >= HTMLMediaElement.HAVE_METADATA ? this.capture() : this.media.addEventListener("loadedmetadata", this.endedHandler, { once: !0 });
	}
	detachMedia() {
		this.media != null && (this.media.removeEventListener("ended", this.endedHandler), this.media = null);
	}
	abort() {
		this.recognition.abort();
	}
	recognitionEnd() {
		this.track != null && (this.interim !== "" && (this.privious = this.interim, this.interim = ""), this.recognition.start(this.track));
	}
	recognitionResult(e) {
		if (this.media == null) return;
		let t = e.results;
		this.interim = Array.from(t).map((e) => e[0].transcript).join(""), this.recognitionTime = this.media.currentTime;
	}
	capture() {
		this.media != null && (this.track = this.media.captureStream().getAudioTracks()[0], this.recognition.start(this.track));
	}
	clear() {
		this.recognitionTime = null, this.privious = "", this.interim = "";
	}
	onAttach() {
		this.clear();
	}
	onDetach() {
		this.clear();
	}
	onSeeking() {
		this.abort(), this.clear();
	}
	destroy() {
		this.abort(), this.recognition.removeEventListener("end", this.recognitionEndHandler), this.recognition.removeEventListener("error", this.clearHandler), this.recognition.removeEventListener("result", this.recognitionResultHandler), this.clear();
	}
	prepare(e) {}
	content(g) {
		if (this.media == null || this.recognitionTime == null) return null;
		let _ = this.privious + (this.privious === "" ? "" : "\n") + this.interim, v = [""];
		for (let e of _) v[v.length - 1].length >= 18 && v.push(""), e == "\n" ? v.push("") : v[v.length - 1] += e;
		let y = (v.length >= 2 ? v[v.length - 2] : "").trim(), b = (v.length >= 1 ? v[v.length - 1] : "").trim(), x = [
			i.from(),
			p.from(7),
			l.from(780, 480),
			u.from(118, 29),
			d.from(4),
			f.from(24),
			n.from(36, 36),
			o.from(),
			t.from(0, 6),
			m.from(),
			c.from(4),
			a.from(1),
			s.from(),
			...Array.from(y).map((e) => r.from(e)),
			...y === "" ? [] : [e.from()],
			...Array.from(b).map((e) => r.from(e))
		];
		return {
			pts: this.recognitionTime,
			duration: Infinity,
			state: h,
			info: {
				association: "ARIB",
				language: "und"
			},
			data: x
		};
	}
};
//#endregion
export { g as default };
