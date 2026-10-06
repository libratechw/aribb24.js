import e from "../b24/independent/index.mjs";
import t from "../b24/datagroup.mjs";
import n, { TIMESTAMP_ROLLOVER as r, pid as i } from "./packet.mjs";
import a, { CRC32 as o } from "./section.mjs";
import s from "./pat.mjs";
import c from "./pmt.mjs";
import l, { DTS as u, PES_header_length as d, PTS as f } from "./pes.mjs";
//#region src/lib/demuxer/mpegts/index.ts
async function* p(p, m) {
	let h = p.pipeThrough(new n()), g = new a(), _ = new a(), v = new l(), y = /* @__PURE__ */ new Map(), b = null, x = null, S = (m?.offset ?? "BOTH") === "NONE" ? 0 : null, C = null, w = null, T = h.getReader();
	for (;;) {
		let { value: n, done: a } = await T.read();
		if (a) return;
		let p = i(n);
		if (p === 0) for (let e of g.feed(n)) {
			if (o(e) !== 0) continue;
			let t = m?.serviceId ?? null;
			b = s(e).find(({ program_number: e }) => t == null || t === e)?.program_map_PID ?? null;
		}
		else if (p === b) for (let e of _.feed(n)) {
			if (o(e) !== 0) continue;
			let t = c(e);
			x = t.find((e) => m?.type === "Superimpose" ? e.type === "ARIBB24_SUPERIMPOSE" : e.type === "ARIBB24_CAPTION")?.elementary_PID ?? null;
			let n = t.find(({ type: e }) => e === "AUDIO"), r = t.find(({ type: e }) => e === "VIDEO");
			C = m?.type === "Superimpose" ? n?.elementary_PID ?? r?.elementary_PID ?? null : null;
			for (let e of t) {
				let t = (m?.offset === "VIDEO" || m?.offset === "BOTH" || m?.offset == null) && e.type === "VIDEO", n = (m?.offset === "AUDIO" || m?.offset === "BOTH" || m?.offset == null) && e.type === "AUDIO", r = C === e.elementary_PID;
				!t && !n && !r || y.has(e.elementary_PID) || y.set(e.elementary_PID, new l());
			}
		}
		else if (y.has(p)) {
			if (!(C === p || S == null)) continue;
			for (let e of y.get(p).feed(n)) {
				let t = f(e);
				t != null && (S ??= t, p === C && (w = t));
			}
		} else if (p === x) for (let i of v.feed(n)) {
			if (S == null) continue;
			let n = e(i.subarray(6 + d(i)));
			if (n == null) continue;
			let a = t(n.data);
			if (a == null) continue;
			let o = m?.type === "Superimpose" ? w : f(i), s = m?.type === "Superimpose" ? w : u(i) ?? f(i);
			o == null || s == null || (yield {
				tag: n.tag,
				pts: (r + o - S) % r / 9e4,
				dts: (r + s - S) % r / 9e4,
				data: a
			});
		}
	}
}
//#endregion
export { p as default };
