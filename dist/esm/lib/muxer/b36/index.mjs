import { ViolationStandardError as e } from "../../../util/error.mjs";
import { secondsToTimecode as t } from "../../../util/timecode.mjs";
import { TimingUnitType as n } from "../../demuxer/b36/index.mjs";
import { ByteBuilder as r } from "../../../util/bytebuilder.mjs";
import i from "./datagroup.mjs";
//#region src/lib/muxer/b36/index.ts
var a = new TextDecoder("shift-jis", { fatal: !0 }), o = /* @__PURE__ */ new Map();
for (let [e, t] of [[0, 128], [161, 223]]) for (let n = e; n < t; n++) {
	let e = [n], t = Uint8Array.from(e);
	try {
		o.set(a.decode(t), e);
	} catch {}
}
for (let [e, t] of [[129, 159], [224, 239]]) for (let n = e; n < t; n++) {
	for (let e = 64; e <= 126; e++) {
		let t = [n, e], r = Uint8Array.from(t);
		try {
			o.set(a.decode(r), t);
		} catch {}
	}
	for (let e = 128; e <= 252; e++) {
		let t = [n, e], r = Uint8Array.from(t);
		try {
			o.set(a.decode(r), t);
		} catch {}
	}
}
var s = (a) => {
	let s = new r();
	for (let e = 0; e < a.label.length; e++) s.writeU8(a.label.charCodeAt(e));
	for (let e = a.label.length; e < 256; e++) s.writeU8(32);
	let c = new r();
	{
		let t = Array.from(a.broadcasterIdentification);
		if (t.some((e) => !o.has(e))) throw new e("broadcasterIdentification cannot convert to shift-jis");
		let n = t.flatMap((e) => o.get(e));
		if (n.length > 6) throw new e("broadcasterIdentification byteLength exceeded");
		for (; n.length < 6;) n.push(32);
		c.write(Uint8Array.from(n).buffer);
	}
	{
		let t = Array.from(a.materialNumber);
		if (t.some((e) => !o.has(e))) throw new e("materialNumber cannot convert to shift-jis");
		let n = t.flatMap((e) => o.get(e));
		if (n.length > 27) throw new e("materialNumber byteLength exceeded");
		for (; n.length < 27;) n.push(32);
		c.write(Uint8Array.from(n).buffer);
	}
	{
		let t = Array.from(a.programTitle);
		if (t.some((e) => !o.has(e))) throw new e("programTitle cannot convert to shift-jis");
		let n = t.flatMap((e) => o.get(e));
		if (n.length > 40) throw new e("programTitle byteLength exceeded");
		for (; n.length < 40;) n.push(32);
		c.write(Uint8Array.from(n).buffer);
	}
	{
		let t = Array.from(a.programSubtitle);
		if (t.some((e) => !o.has(e))) throw new e("programSubtitle cannot convert to shift-jis");
		let n = t.flatMap((e) => o.get(e));
		if (n.length > 40) throw new e("programSubtitle byteLength exceeded");
		for (; n.length < 40;) n.push(32);
		c.write(Uint8Array.from(n).buffer);
	}
	if (c.writeU8(a.programMaterialType.charCodeAt(0)), c.writeU8(a.registrationMode.charCodeAt(0)), a.languageCode.length !== 3) throw new e("languageCode length must be 3");
	if (/[^a-z]/.test(a.languageCode)) throw new e("languageCode length must lowercase");
	for (let e = 0; e < 3; e++) c.writeU8(a.languageCode.charCodeAt(e));
	for (let e = 0; e < 2; e++) c.writeU8(a.displayMode.charCodeAt(e));
	c.writeU8(a.programType.charCodeAt(0)), c.writeU8((a.sound ? "*" : " ").charCodeAt(0));
	{
		let e = a.totalPages.toString(10).padStart(4, "0");
		for (let t = 0; t < 4; t++) c.writeU8(e.charCodeAt(t));
	}
	{
		let e = a.totalBytes.toString(10).padStart(8, "0");
		for (let t = 0; t < 8; t++) c.writeU8(e.charCodeAt(t));
	}
	c.writeU8((a.untime ? "*" : " ").charCodeAt(0));
	for (let e = 0; e < 2; e++) c.writeU8(a.realtimeTimingType.charCodeAt(e));
	switch (c.writeU8(a.timingUnitType.charCodeAt(0)), a.timingUnitType) {
		case n.FRAME: {
			let e = t(a.initialTime).replaceAll(/[:;]/g, "");
			for (let t = 0; t < 8; t++) c.writeU8(e.charCodeAt(t));
			c.writeU8(70);
			break;
		}
		case n.TIME: {
			let e = Math.ceil(a.initialTime * 100) % 100, t = Math.floor(a.initialTime) % 60, n = Math.floor((a.initialTime - t) / 60) % 60, r = `${Math.floor((a.initialTime - t - n * 60) / 3600).toString(10).padStart(2, "0")}${n.toString(10).padStart(2, "0")}${t.toString(10).padStart(2, "0")}${e.toString(10).padStart(2, "0")}`;
			for (let e = 0; e < 8; e++) c.writeU8(r.charCodeAt(e));
			c.writeU8(48);
			break;
		}
	}
	c.writeU8(a.syncronizationMode.charCodeAt(0));
	for (let e = 0; e < 2; e++) c.writeU8(a.timeControlMode.charCodeAt(e));
	for (let e = 0; e < 8; e++) c.writeU8((a.extensible[e] ? "*" : " ").charCodeAt(0));
	for (let e = 0; e < 8; e++) c.writeU8((a.compatible[e] ? "*" : " ").charCodeAt(0));
	if (a.expireDate == null) for (let e = 0; e < 8; e++) c.writeU8(32);
	else {
		let e = `${a.expireDate[0].toString(10).padStart(4, "0")}${a.expireDate[1].toString(10).padStart(2, "0")}${a.expireDate[2].toString(10).padStart(2, "0")}`;
		for (let t = 0; t < 8; t++) c.writeU8(e.charCodeAt(t));
	}
	{
		let t = Array.from(a.author);
		if (t.some((e) => !o.has(e))) throw new e("author cannot convert to shift-jis");
		let n = t.flatMap((e) => o.get(e));
		if (n.length > 20) throw new e("author byteLength exceeded");
		for (; n.length < 20;) n.push(32);
		c.write(Uint8Array.from(n).buffer);
	}
	if (a.creationDateTime != null) {
		let e = `${a.creationDateTime[0].toString(10).padStart(4, "0")}${a.creationDateTime[1].toString(10).padStart(2, "0")}${a.creationDateTime[2].toString(10).padStart(2, "0")}${a.creationDateTime[3].toString(10).padStart(2, "0")}${a.creationDateTime[4].toString(10).padStart(2, "0")}`;
		for (let t = 0; t < 12; t++) c.writeU8(e.charCodeAt(t));
	} else for (let e = 0; e < 12; e++) c.writeU8(32);
	if (a.broadcastStartDate != null) {
		let e = `${a.broadcastStartDate[0].toString(10).padStart(4, "0")}${a.broadcastStartDate[1].toString(10).padStart(2, "0")}${a.broadcastStartDate[2].toString(10).padStart(2, "0")}`;
		for (let t = 0; t < 8; t++) c.writeU8(e.charCodeAt(t));
	} else for (let e = 0; e < 8; e++) c.writeU8(32);
	if (a.broadcastEndDate != null) {
		let e = `${a.broadcastEndDate[0].toString(10).padStart(4, "0")}${a.broadcastEndDate[1].toString(10).padStart(2, "0")}${a.broadcastEndDate[2].toString(10).padStart(2, "0")}`;
		for (let t = 0; t < 8; t++) c.writeU8(e.charCodeAt(t));
	} else for (let e = 0; e < 8; e++) c.writeU8(32);
	for (let e = 0; e < 7; e++) c.writeU8((a.broadcastDaysOfWeek[e] ? "*" : " ").charCodeAt(0));
	if (a.broadcastStartTime != null) {
		let e = `${a.broadcastStartTime[0].toString(10).padStart(2, "0")}${a.broadcastStartTime[1].toString(10).padStart(2, "0")}${a.broadcastStartTime[2].toString(10).padStart(2, "0")}`;
		for (let t = 0; t < 6; t++) c.writeU8(e.charCodeAt(t));
	} else for (let e = 0; e < 6; e++) c.writeU8(32);
	if (a.broadcastEndTime != null) {
		let e = `${a.broadcastEndTime[0].toString(10).padStart(2, "0")}${a.broadcastEndTime[1].toString(10).padStart(2, "0")}${a.broadcastEndTime[2].toString(10).padStart(2, "0")}`;
		for (let t = 0; t < 6; t++) c.writeU8(e.charCodeAt(t));
	} else for (let e = 0; e < 6; e++) c.writeU8(32);
	{
		let t = Array.from(a.memo);
		if (t.some((e) => !o.has(e))) throw new e("memo cannot convert to shift-jis");
		let n = t.flatMap((e) => o.get(e));
		if (n.length > 60) throw new e("memo byteLength exceeded");
		for (; n.length < 60;) n.push(32);
		c.write(Uint8Array.from(n).buffer);
	}
	for (let e = 0; e < 45; e++) c.writeU8(32);
	c.writeU8((a.completed ? "*" : " ").charCodeAt(0)), c.writeU8((a.usersAreaUsed ? "*" : " ").charCodeAt(0)), a.usersAreaUsed && (c.writeU8(a.writingFormatConversionMode), c.writeU8(a.drcsConversionMode << 6 | 63));
	let l = c.build();
	s.writeU32(l.byteLength), s.write(l), s.write(new ArrayBuffer(Math.floor((4 + l.byteLength + 255) / 256) * 256 - (4 + l.byteLength)));
	for (let c of a.pages) {
		let a = new r();
		for (let e = 0; e < 6; e++) a.writeU8(c.pageNumber.charCodeAt(e));
		a.writeU8(c.pageMaterialType.charCodeAt(0));
		for (let e = 0; e < 2; e++) a.writeU8(c.displayTimingType.charCodeAt(e));
		for (let e = 0; e < 1; e++) a.writeU8(c.timingUnitType.charCodeAt(e));
		switch (c.timingUnitType) {
			case n.FRAME: {
				let e = t(c.displayTiming).replaceAll(/[:;]/g, "");
				for (let t = 0; t < 8; t++) a.writeU8(e.charCodeAt(t));
				a.writeU8(70);
				break;
			}
			case n.TIME: {
				let e = Math.round(c.displayTiming * 100) % 100, t = Math.floor(c.displayTiming) % 60, n = Math.floor((c.displayTiming - t) / 60) % 60, r = `${Math.floor((c.displayTiming - t - n * 60) / 3600).toString(10).padStart(2, "0")}${n.toString(10).padStart(2, "0")}${t.toString(10).padStart(2, "0")}${e.toString(10).padStart(2, "0")}`;
				for (let e = 0; e < 8; e++) a.writeU8(r.charCodeAt(e));
				a.writeU8(48);
				break;
			}
		}
		if (c.clearTiming === Infinity) for (let e = 0; e < 9; e++) a.writeU8(32);
		else switch (c.timingUnitType) {
			case n.FRAME: {
				let e = t(c.clearTiming).replaceAll(/[:;]/g, "");
				for (let t = 0; t < 8; t++) a.writeU8(e.charCodeAt(t));
				a.writeU8(70);
				break;
			}
			case n.TIME: {
				let e = Math.round(c.clearTiming * 100) % 100, t = Math.floor(c.clearTiming) % 60, n = Math.floor((c.clearTiming - t) / 60) % 60, r = `${Math.floor((c.clearTiming - t - n * 60) / 3600).toString(10).padStart(2, "0")}${n.toString(10).padStart(2, "0")}${t.toString(10).padStart(2, "0")}${e.toString(10).padStart(2, "0")}`;
				for (let e = 0; e < 8; e++) a.writeU8(r.charCodeAt(e));
				a.writeU8(48);
				break;
			}
		}
		for (let e = 0; e < 2; e++) a.writeU8(c.timeControlMode.charCodeAt(e));
		for (let e = 0; e < 3; e++) a.writeU8((c.clearScreen ? "OFF" : "   ").charCodeAt(e));
		for (let e = 0; e < 3; e++) a.writeU8(c.displayFormat.charCodeAt(e));
		for (let e = 0; e < 1; e++) a.writeU8(c.displayAspectRatio.charCodeAt(e));
		if (c.displayWindowArea == null) for (let e = 0; e < 16; e++) a.writeU8(32);
		else {
			let e = c.displayWindowArea[0][0].toString(10).padStart(4, "0"), t = c.displayWindowArea[0][1].toString(10).padStart(4, "0"), n = c.displayWindowArea[1][0].toString(10).padStart(4, "0"), r = c.displayWindowArea[1][1].toString(10).padStart(4, "0");
			for (let t = 0; t < 4; t++) a.writeU8(e.charCodeAt(t));
			for (let e = 0; e < 4; e++) a.writeU8(t.charCodeAt(e));
			for (let e = 0; e < 4; e++) a.writeU8(n.charCodeAt(e));
			for (let e = 0; e < 4; e++) a.writeU8(r.charCodeAt(e));
		}
		a.writeU8(c.scrollType.charCodeAt(0)), a.writeU8(c.scrollDirectionType.charCodeAt(0)), a.writeU8((c.sound ? "*" : " ").charCodeAt(0));
		{
			let e = c.pageDataBytes.toString(10).padStart(5, "0");
			for (let t = 0; t < 5; t++) a.writeU8(e.charCodeAt(t));
		}
		for (let e = 0; e < 3; e++) a.writeU8((c.deleted ? "ERS" : "   ").charCodeAt(e));
		{
			let t = Array.from(c.memo);
			if (t.some((e) => !o.has(e))) throw new e("memo cannot convert to shift-jis");
			let n = t.flatMap((e) => o.get(e));
			if (n.length > 20) throw new e("memo byteLength exceeded");
			for (; n.length < 20;) n.push(32);
			a.write(Uint8Array.from(n).buffer);
		}
		for (let e = 0; e < 32; e++) a.writeU8(32);
		a.writeU8((c.completed ? "*" : " ").charCodeAt(0)), a.writeU8((c.usersAreaUsed ? "*" : " ").charCodeAt(0)), c.usersAreaUsed && (a.writeU8(c.writingFormatConversionMode), a.writeU8(c.drcsConversionMode << 6 | 63));
		let l = a.build(), u = i(c.management), d = c.tag === "ReservedPage" ? /* @__PURE__ */ new ArrayBuffer(0) : i(c.statement), f = 3 + l.byteLength + (3 + u.byteLength) + (c.tag === "ReservedPage" ? 0 : 4 + d.byteLength);
		s.writeU32(f), s.writeU8(42), s.writeU16(l.byteLength), s.write(l), s.writeU8(58), s.writeU16(u.byteLength), s.write(u), c.tag === "ActualPage" && (s.writeU8(74), s.writeU24(d.byteLength), s.write(d)), s.write(new ArrayBuffer(Math.floor((4 + f + 255) / 256) * 256 - (4 + f)));
	}
	return s.build();
};
//#endregion
export { s as default };
