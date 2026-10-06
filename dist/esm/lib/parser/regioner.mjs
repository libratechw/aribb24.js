import { ARIBB24Parser as e, ARIBB24_CHARACTER_SIZE as t } from "./parser.mjs";
//#region src/lib/parser/regioner.ts
var n = { from(e, t) {
	return {
		tag: "Script",
		sup: e,
		sub: t
	};
} }, r = { from(e) {
	return {
		tag: "Normal",
		text: e
	};
} }, i = { from(e, t) {
	return {
		tag: "Ruby",
		text: e,
		ruby: t
	};
} }, a = (e) => e === "Middle" ? "Normal" : e, o = {
	GUESS: "GUESS_RUBY",
	PRESERVE: "PRESERVE",
	IGNORE: "IGNORE"
}, s = (s, c, l) => {
	let u = s.filter((e) => e.tag === "Character" || e.tag === "DRCS").toSorted((e, t) => e.state.position[1] === t.state.position[1] ? Math.sign(e.state.position[0] - t.state.position[0]) : Math.sign(e.state.position[1] - t.state.position[1])), d = [];
	for (let t of u) {
		let n = d.find((n) => {
			let r = n.position[0] + n.area[0], i = n.position[1], a = t.state.position[0], o = t.state.position[1] + 1 - e.box(t.state)[1];
			return r == a && i == o;
		}), i = n != null && n.background === t.state.background, o = n != null && n.highlight === (t.state.highlight !== 0), s = n != null && a(n.size) === a(t.state.size);
		i && o && s ? (n.area = [n.area[0] + e.box(t.state)[0], n.area[1]], n.spans.push(r.from([t]))) : d.push({
			plane: [...t.state.plane],
			margin: [...t.state.margin],
			position: [t.state.position[0], t.state.position[1] - (e.box(t.state)[1] - 1)],
			area: [e.box(t.state)[0], e.box(t.state)[1]],
			size: a(t.state.size),
			fontsize: t.state.fontsize,
			background: t.state.background,
			highlight: t.state.highlight !== 0,
			spans: [r.from([t])]
		});
	}
	for (let { spans: e } of d) for (let t = 0; t < e.length - 1; t++) {
		let n = e[t + 0], r = e[t + 1];
		n.tag === "Normal" && n.tag === r.tag && (n.text.push(...r.text), e.splice(t + 1, 1), t--);
	}
	if (c.association !== "ARIB") return d;
	for (;;) {
		let e = !1;
		LOOP: for (let i of d.filter(({ size: e }) => e === t.Normal)) {
			let a = i.position[0] + i.area[0], o = i.position[1] + 0, s = i.position[1] + i.area[1];
			for (let c = 0; c < d.length; c++) {
				let l = d[c];
				if (l.size !== t.Small) continue;
				let u = l.position[0], f = l.position[1];
				if (!(a !== u || o !== f)) for (let o = 0; o < d.length; o++) {
					if (o === c) continue;
					let u = d[o];
					if (u.size !== t.Small) continue;
					let f = u.position[0], p = u.position[1] + u.area[1];
					if (a !== f || s !== p) continue;
					i.area[0] += Math.min(l.area[0], u.area[0]);
					let m = Math.min(l.spans[0].text.length, u.spans[0].text.length), h = [];
					for (let e = 0; e < m; e++) {
						let t = l.spans.at(0)?.text.at(e) ?? null, r = u.spans.at(0)?.text.at(e) ?? null;
						t == null || t.tag == "Script" || r == null || r.tag == "Script" || h.push(n.from(t, r));
					}
					i.spans.push(r.from(h)), d.splice(Math.max(c, o), 1), d.splice(Math.min(c, o), 1), e = !0;
					break LOOP;
				}
			}
		}
		if (!e) break;
	}
	for (;;) {
		let e = !1;
		LOOP: for (let t = 0; t < d.length; t++) {
			let n = d[t].position[0] + d[t].area[0], r = d[t].position[1] + 0, i = d[t].position[1] + d[t].area[1];
			for (let a = t + 1; a < d.length; a++) {
				let o = d[a].position[0], s = d[a].position[1] + 0, c = d[a].position[1] + d[a].area[1];
				if (!(n !== o || r !== s || i !== c)) {
					d[t].area[0] += d[a].area[0], d[t].spans.push(...d[a].spans), d.splice(a, 1), e = !0;
					break LOOP;
				}
			}
		}
		if (!e) break;
	}
	if (l === o.GUESS) for (;;) {
		let n = !1;
		LOOP: for (let a of d.filter(({ size: e }) => e === t.Normal)) {
			let o = a.position[0] + 0, s = a.position[0] + a.area[0], c = a.position[1], l = null, u = 0;
			for (let e = 0; e < d.length; e++) {
				let n = d[e];
				if (n.size !== t.Small) continue;
				let r = n.position[0] + 0, i = n.position[0] + n.area[0];
				if (c !== n.position[1] + n.area[1] || o >= i || s <= r) continue;
				let a = Math.min(s, i) - Math.max(o, r);
				a > u && (u = a, l = e);
			}
			if (l != null) {
				let o = d[l];
				if (o.size !== t.Small) continue;
				let s = o.position[0] + 0, c = o.position[0] + o.area[0], u = a.spans.flatMap((e) => e.text), f = u.filter((t) => {
					let n = t.tag === "Script" ? t.sup : t;
					return n.state.position[0], n.state.position[0] + e.box(n.state)[0] <= s;
				}), p = u.filter((t) => {
					let n = t.tag === "Script" ? t.sup : t, r = n.state.position[0];
					return s < n.state.position[0] + e.box(n.state)[0] && r < c;
				}), m = u.filter((t) => {
					let n = t.tag === "Script" ? t.sup : t, r = n.state.position[0];
					return n.state.position[0] + e.box(n.state)[0], c <= r;
				}), h = o.spans.flatMap((e) => e.text);
				a.spans = [
					r.from(f),
					i.from(p, h),
					r.from(m)
				], d.splice(l, 1), n = !0;
				break LOOP;
			}
		}
		if (!n) break;
	}
	return l === o.PRESERVE ? d : d.filter((e) => e.size !== t.Small);
};
//#endregion
export { o as SSZ_RUBY_DETECTION, s as default };
