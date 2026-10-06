import { exit as e } from "./exit.mjs";
//#region src/runtime/cli/args.ts
var t = () => globalThis.Bun.argv, n = () => globalThis.Deno.args, r = () => process.argv, i = () => {
	if (globalThis.Deno) return n();
	if (globalThis.Bun) return t();
	if (globalThis.process?.release?.name === "node") return r();
	throw Error("UnSupported Runtime!");
}, a = (t, n, r, i) => {
	let a = {};
	for (let o = 0; o < t.length; o++) {
		let s = n.find((e) => t[o] === e.long || t[o] === e.short);
		if (s == null) continue;
		let c = s.long.replace(/^-*/, "");
		switch (s.action) {
			case "default":
				a[c] = t[o + 1], o++;
				continue;
			case "store_true":
				a[c] = !0;
				continue;
			case "help":
				r && console.error(i ? `${r}: ${i}` : `${r}`);
				for (let e of n) console.error(`${r ? " " : ""}${e.long}: ${e.help}`);
				throw e(0), Error("Not Reachable");
		}
	}
	return a;
};
//#endregion
export { i as args, a as parseArgs };
