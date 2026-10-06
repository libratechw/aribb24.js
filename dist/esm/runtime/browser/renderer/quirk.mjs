import { ARIBB24_CHARACTER_SIZE as e } from "../../../lib/parser/parser.mjs";
import "../../common/quirk.mjs";
//#region src/runtime/browser/renderer/quirk.ts
var t = (e) => e.association === "SBTVD", n = (e) => e.association === "SBTVD", r = (e) => {
	if (n(e.info)) return !0;
	let t = e.state.elapsed_time;
	for (let n of e.data) if (n.tag === "TimeControlWait" && (t += n.seconds), n.tag === "ClearScreen" && t === 0) return !0;
	return !1;
}, i = (t, n) => n.association !== "ARIB" || n.language !== "jpn" ? !1 : t === e.Small;
//#endregion
export { i as shouldIgnoreSmallAsRuby, n as shouldNotAssumeUseClearScreen, t as shouldRemoveTransparentSpace, r as startsNewCaptionPicture };
