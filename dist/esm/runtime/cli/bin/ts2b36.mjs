#!/usr/bin/env node
import e from "../../../lib/demuxer/mpegts/index.mjs";
import t from "../../../lib/muxer/b36/datagroup.mjs";
import n from "../../../lib/muxer/b36/index.mjs";
import { readableStream as r } from "../stream.mjs";
import { args as i, parseArgs as a } from "../args.mjs";
import { getTokenizeInformation as o } from "../info.mjs";
import { writeFS as s } from "../file.mjs";
//#region src/runtime/cli/bin/ts2b36.ts
var c = [
	{
		long: "--input",
		short: "-i",
		help: "Specify Input File (.ts)",
		action: "default"
	},
	{
		long: "--output",
		short: "-o",
		help: "Specify Output File (.1HD)",
		action: "default"
	},
	{
		long: "--language",
		short: "-l",
		help: "Specify language",
		action: "default"
	},
	{
		long: "--author",
		short: "-a",
		help: "Specify author",
		action: "default"
	},
	{
		long: "--help",
		short: "-h",
		help: "Show help message",
		action: "help"
	}
];
(async () => {
	let l = a(i(), c, "ts2b36", "MPEG-TS ARIB Caption (Profile A) to ARIB STD-B36"), u = l.input ?? "-", d = l.output ?? "-", f = l.author ?? "", p = Number.isNaN(Number.parseInt(l.language)) ? l.language ?? 0 : Number.parseInt(l.language), m = [];
	{
		let n = null, i = null, a = 1;
		for await (let s of e(await r(u))) {
			if (s.tag !== "Caption") continue;
			let e = s.data;
			if (e.tag === "CaptionManagement") i = typeof p == "number" ? p : [...e.languages].sort(({ lang: e }, { lang: t }) => e - t).filter(({ iso_639_language_code: e }) => e === p)?.[0]?.lang ?? null, n ?? (n = e, n.languages = n.languages.filter((e) => e.lang === i), m.push({
				tag: "ReservedPage",
				pageNumber: "000000",
				pageMaterialType: "1",
				displayTimingType: "  ",
				timingUnitType: "T",
				displayTiming: 0,
				clearTiming: Infinity,
				timeControlMode: "FR",
				displayFormat: "HDH",
				clearScreen: !1,
				displayWindowArea: null,
				displayAspectRatio: " ",
				scrollType: "F",
				scrollDirectionType: "H",
				sound: !1,
				pageDataBytes: 0,
				deleted: !1,
				memo: "",
				completed: !1,
				usersAreaUsed: !1,
				management: e
			}));
			else if (n == null) continue;
			else {
				let r = n.languages.find((t) => t.lang === e.lang);
				if (r == null || i !== e.lang) continue;
				let c = o(r.iso_639_language_code, r.TCS);
				if (c == null) continue;
				let [l, u, d] = c, f = u.tokenize(e), p = Infinity, h = 0;
				for (let e of f) if (e.tag === "ClearScreen") {
					if (h === 0) continue;
					p = h;
				} else e.tag === "TimeControlWait" && (h += e.seconds);
				m.push({
					tag: "ActualPage",
					pageNumber: a.toString(10).padStart(6, "0"),
					pageMaterialType: "1",
					displayTimingType: "  ",
					timingUnitType: "T",
					displayTiming: s.pts,
					clearTiming: s.pts + p,
					timeControlMode: "FR",
					displayFormat: "HDH",
					clearScreen: !1,
					displayWindowArea: null,
					displayAspectRatio: " ",
					scrollType: "F",
					scrollDirectionType: "H",
					sound: !1,
					pageDataBytes: t(e).byteLength,
					deleted: !1,
					memo: "",
					completed: !1,
					usersAreaUsed: !1,
					management: n,
					statement: e
				}), a++;
			}
		}
	}
	let h = {
		label: "DCAPTION",
		broadcasterIdentification: "",
		materialNumber: "",
		programTitle: "",
		programSubtitle: "",
		programMaterialType: "0",
		registrationMode: "N",
		languageCode: "jpn",
		displayMode: "22",
		programType: "C",
		sound: !1,
		totalPages: m.length,
		totalBytes: 1,
		untime: !1,
		realtimeTimingType: "LT",
		timingUnitType: "T",
		initialTime: 0,
		syncronizationMode: "P",
		timeControlMode: "FR",
		extensible: [
			!1,
			!1,
			!1,
			!0,
			!1,
			!1,
			!1,
			!1
		],
		compatible: [
			!0,
			!1,
			!1,
			!1,
			!1,
			!1,
			!1,
			!1
		],
		expireDate: null,
		author: f,
		creationDateTime: null,
		broadcastStartDate: null,
		broadcastEndDate: null,
		broadcastDaysOfWeek: [
			!1,
			!1,
			!1,
			!1,
			!1,
			!1,
			!1
		],
		broadcastStartTime: null,
		broadcastEndTime: null,
		memo: "Created by aribb24.js",
		completed: !0,
		usersAreaUsed: !1,
		pages: m
	}, g = n(h);
	s(d, n({
		...h,
		totalBytes: g.byteLength
	}));
})();
//#endregion
