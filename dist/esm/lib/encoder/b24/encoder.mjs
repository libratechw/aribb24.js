import { ExhaustivenessError as e } from "../../../util/error.mjs";
import { CONTROL_CODES as t, CSI_CODE as n } from "../../tokenizer/b24/tokenizer.mjs";
//#region src/lib/encoder/b24/encoder.ts
var r = (e, ...n) => {
	let r = [e], i = 32;
	for (let e of n.toReversed()) {
		r.unshift(i);
		do
			r.unshift(48 | e % 10), e = Math.floor(e / 10);
		while (e !== 0);
		i = 59;
	}
	return r.unshift(t.CSI), Uint8Array.from(r).buffer;
}, i = class {
	encodeTokenHandler = this.encodeToken.bind(this);
	encodeToken(e) {
		switch (e.tag) {
			case "Character": return this.encodeCharacter(e);
			case "DRCS": return this.encodeDRCS(e);
			case "Bitmap": return this.encodeBitmap(e);
			case "Mosaic": return this.encodeMosaic(e);
			default: return this.encodeControl(e);
		}
	}
	encodeControl(i) {
		switch (i.tag) {
			case "Null": return Uint8Array.from([t.NUL]).buffer;
			case "Bell": return Uint8Array.from([t.BEL]).buffer;
			case "ActivePositionBackward": return Uint8Array.from([t.APB]).buffer;
			case "ActivePositionForward": return Uint8Array.from([t.APF]).buffer;
			case "ActivePositionDown": return Uint8Array.from([t.APD]).buffer;
			case "ActivePositionUp": return Uint8Array.from([t.APU]).buffer;
			case "ClearScreen": return Uint8Array.from([t.CS]).buffer;
			case "ActivePositionReturn": return Uint8Array.from([t.APR]).buffer;
			case "ParameterizedActivePositionForward": return Uint8Array.from([t.PAPF, 64 | i.x]).buffer;
			case "Cancel": return Uint8Array.from([t.CAN]).buffer;
			case "ActivePositionSet": return Uint8Array.from([
				t.APS,
				64 | i.y,
				64 | i.x
			]).buffer;
			case "RecordSeparator": return Uint8Array.from([t.RS]).buffer;
			case "UnitSeparator": return Uint8Array.from([t.US]).buffer;
			case "Space": return Uint8Array.from([t.SP]).buffer;
			case "Delete": return Uint8Array.from([t.DEL]).buffer;
			case "BlackForeground": return Uint8Array.from([t.BKF]).buffer;
			case "RedForeground": return Uint8Array.from([t.RDF]).buffer;
			case "GreenForeground": return Uint8Array.from([t.GRF]).buffer;
			case "YellowForeground": return Uint8Array.from([t.YLF]).buffer;
			case "BlueForeground": return Uint8Array.from([t.BLF]).buffer;
			case "MagentaForeground": return Uint8Array.from([t.MGF]).buffer;
			case "CyanForeground": return Uint8Array.from([t.CNF]).buffer;
			case "WhiteForeground": return Uint8Array.from([t.WHF]).buffer;
			case "SmallSize": return Uint8Array.from([t.SSZ]).buffer;
			case "MiddleSize": return Uint8Array.from([t.MSZ]).buffer;
			case "NormalSize": return Uint8Array.from([t.NSZ]).buffer;
			case "CharacterSizeControl": return Uint8Array.from([t.SZX, i.type]).buffer;
			case "ColorControlForeground": return Uint8Array.from([t.COL, 64 | i.color]).buffer;
			case "ColorControlBackground": return Uint8Array.from([t.COL, 80 | i.color]).buffer;
			case "ColorControlHalfForeground": return Uint8Array.from([t.COL, 96 | i.color]).buffer;
			case "ColorControlHalfBackground": return Uint8Array.from([t.COL, 112 | i.color]).buffer;
			case "PalletControl": return Uint8Array.from([
				t.COL,
				32,
				64 | i.pallet
			]).buffer;
			case "FlashingControl": return Uint8Array.from([t.FLC, i.type]).buffer;
			case "ConcealmentMode": return Uint8Array.from([t.CDC, i.type]).buffer;
			case "SingleConcealmentMode": return Uint8Array.from([t.CDC, i.type]).buffer;
			case "ReplacingConcealmentMode": return Uint8Array.from([
				t.CDC,
				32,
				i.type
			]).buffer;
			case "PatternPolarityControl": return Uint8Array.from([t.POL, i.type]).buffer;
			case "WritingModeModification": return Uint8Array.from([t.WMM, i.type]).buffer;
			case "HilightingCharacterBlock": return Uint8Array.from([t.HLC, 64 | i.enclosure]).buffer;
			case "RepeatCharacter": return Uint8Array.from([t.RPC, 64 | i.repeat]).buffer;
			case "StartLining": return Uint8Array.from([t.STL]).buffer;
			case "StopLining": return Uint8Array.from([t.SPL]).buffer;
			case "TimeControlWait": return Uint8Array.from([
				t.TIME,
				32,
				64 | i.seconds * 10
			]).buffer;
			case "TimeControlMode": return Uint8Array.from([
				t.TIME,
				40,
				i.type
			]).buffer;
			case "SetWritingFormat": return r(n.SWF, i.format);
			case "SetDisplayFormat": return r(n.SDF, i.horizontal, i.vertical);
			case "SetDisplayPosition": return r(n.SDP, i.horizontal, i.vertical);
			case "CharacterCompositionDotDesignation": return r(n.SSM, i.horizontal, i.vertical);
			case "SetHorizontalSpacing": return r(n.SHS, i.spacing);
			case "SetVerticalSpacing": return r(n.SVS, i.spacing);
			case "ActiveCoordinatePositionSet": return r(n.ACPS, i.x, i.y);
			case "RasterColourCommand": return r(n.RCS, i.color);
			case "OrnamentControlNone": return r(n.ORN, 0);
			case "OrnamentControlHemming": return r(n.ORN, 1, i.color);
			case "OrnamentControlShade": return r(n.ORN, 2, i.color);
			case "OrnamentControlHollow": return r(n.ORN, 3);
			case "BuiltinSoundReplay": return r(n.PRA, i.sound);
			default: throw new e(i, "Unexpeced ARIBB24Token in encodeControl)");
		}
	}
};
//#endregion
export { i as default };
