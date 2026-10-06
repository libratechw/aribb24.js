//#region src/lib/tokenizer/token.ts
var e = { from(e, t = !1) {
	return {
		tag: "Character",
		character: e,
		non_spacing: t
	};
} }, t = { from() {
	return { tag: "Mosaic" };
} }, n = { from(e, t, n, r, i = "") {
	return {
		tag: "DRCS",
		width: e,
		height: t,
		depth: n,
		binary: r,
		combining: i
	};
} }, r = { from(e, t, n, r) {
	return {
		tag: "Bitmap",
		x_position: e,
		y_position: t,
		flc_colors: n,
		binary: r
	};
} }, i = { from() {
	return { tag: "Null" };
} }, a = { from() {
	return { tag: "Bell" };
} }, o = { from() {
	return { tag: "ActivePositionBackward" };
} }, s = { from() {
	return { tag: "ActivePositionForward" };
} }, c = { from() {
	return { tag: "ActivePositionDown" };
} }, l = { from() {
	return { tag: "ActivePositionUp" };
} }, u = { from() {
	return { tag: "ClearScreen" };
} }, d = { from() {
	return { tag: "ActivePositionReturn" };
} }, f = { from(e) {
	return {
		tag: "ParameterizedActivePositionForward",
		x: e
	};
} }, p = { from() {
	return { tag: "Cancel" };
} }, m = { from(e, t) {
	return {
		tag: "ActivePositionSet",
		x: e,
		y: t
	};
} }, h = { from() {
	return { tag: "RecordSeparator" };
} }, g = { from() {
	return { tag: "UnitSeparator" };
} }, _ = { from() {
	return { tag: "Space" };
} }, v = { from() {
	return { tag: "Delete" };
} }, y = { from() {
	return { tag: "BlackForeground" };
} }, b = { from() {
	return { tag: "RedForeground" };
} }, x = { from() {
	return { tag: "GreenForeground" };
} }, S = { from() {
	return { tag: "YellowForeground" };
} }, C = { from() {
	return { tag: "BlueForeground" };
} }, w = { from() {
	return { tag: "MagentaForeground" };
} }, T = { from() {
	return { tag: "CyanForeground" };
} }, E = { from() {
	return { tag: "WhiteForeground" };
} }, D = { from() {
	return { tag: "SmallSize" };
} }, O = { from() {
	return { tag: "MiddleSize" };
} }, k = { from() {
	return { tag: "NormalSize" };
} }, A = {
	TINY: 96,
	DOUBLE_HEIGHT: 65,
	DOUBLE_WIDTH: 68,
	DOUBLE_HEIGHT_AND_WIDTH: 69,
	SPECIAL_1: 107,
	SPECIAL_2: 100
}, j = { from(e) {
	return {
		tag: "CharacterSizeControl",
		type: e
	};
} }, M = { from(e) {
	return {
		tag: "ColorControlForeground",
		color: e
	};
} }, N = { from(e) {
	return {
		tag: "ColorControlBackground",
		color: e
	};
} }, P = { from(e) {
	return {
		tag: "ColorControlHalfForeground",
		color: e
	};
} }, F = { from(e) {
	return {
		tag: "ColorControlHalfBackground",
		color: e
	};
} }, I = { from(e) {
	return {
		tag: "PalletControl",
		pallet: e
	};
} }, L = {
	NORMAL: 64,
	INVERTED: 71,
	STOP: 79
}, R = { from(e) {
	return {
		tag: "FlashingControl",
		type: e
	};
} }, z = { STOP: 79 }, B = { from(e) {
	return {
		tag: "ConcealmentMode",
		type: e
	};
} }, V = { START: 64 }, H = { from(e) {
	return {
		tag: "SingleConcealmentMode",
		type: e
	};
} }, U = {
	START: 64,
	FIRST: 65,
	SECOND: 66,
	THIRD: 67,
	FOURTH: 68,
	FIFTH: 69,
	SIXTH: 70,
	SEVENTH: 71,
	EIGHTH: 72,
	NINTH: 73,
	TENTH: 74
}, W = { from(e) {
	return {
		tag: "ReplacingConcealmentMode",
		type: e
	};
} }, G = {
	NORMAL: 64,
	INVERTED_1: 65,
	INVERTED_2: 66
}, K = { from(e) {
	return {
		tag: "PatternPolarityControl",
		type: e
	};
} }, q = {
	BOTH: 64,
	FOREGROUND: 68,
	BACKGROUND: 69
}, J = { from(e) {
	return {
		tag: "WritingModeModification",
		type: e
	};
} }, Y = { from(e) {
	return {
		tag: "HilightingCharacterBlock",
		enclosure: e
	};
} }, X = { from(e) {
	return {
		tag: "RepeatCharacter",
		repeat: e
	};
} }, Z = { from() {
	return { tag: "StartLining" };
} }, Q = { from() {
	return { tag: "StopLining" };
} }, $ = { from(e) {
	return {
		tag: "TimeControlWait",
		seconds: e
	};
} }, ee = {
	FREE: 64,
	REAL: 65,
	OFFSET: 66,
	UNIQUE: 67
}, te = { from(e) {
	return {
		tag: "TimeControlMode",
		type: e
	};
} }, ne = { from(e) {
	return {
		tag: "SetWritingFormat",
		format: e
	};
} }, re = { from(e, t) {
	return {
		tag: "SetDisplayFormat",
		horizontal: e,
		vertical: t
	};
} }, ie = { from(e, t) {
	return {
		tag: "SetDisplayPosition",
		horizontal: e,
		vertical: t
	};
} }, ae = { from(e, t) {
	return {
		tag: "CharacterCompositionDotDesignation",
		horizontal: e,
		vertical: t
	};
} }, oe = { from(e) {
	return {
		tag: "SetHorizontalSpacing",
		spacing: e
	};
} }, se = { from(e) {
	return {
		tag: "SetVerticalSpacing",
		spacing: e
	};
} }, ce = { from(e, t) {
	return {
		tag: "ActiveCoordinatePositionSet",
		x: e,
		y: t
	};
} }, le = {
	NONE: 0,
	HEMMING: 1,
	SHADE: 2,
	HOLLOW: 3
}, ue = { from() {
	return { tag: "OrnamentControlNone" };
} }, de = { from(e) {
	return {
		tag: "OrnamentControlHemming",
		color: e
	};
} }, fe = { from(e) {
	return {
		tag: "OrnamentControlShade",
		color: e
	};
} }, pe = { from() {
	return { tag: "OrnamentControlHollow" };
} }, me = { from(e) {
	return {
		tag: "BuiltinSoundReplay",
		sound: e
	};
} }, he = { from(e) {
	return {
		tag: "RasterColourCommand",
		color: e
	};
} };
//#endregion
export { ce as ARIBB24ActiveCoordinatePositionSetToken, o as ARIBB24ActivePositionBackwardToken, c as ARIBB24ActivePositionDownToken, s as ARIBB24ActivePositionForwardToken, d as ARIBB24ActivePositionReturnToken, m as ARIBB24ActivePositionSetToken, l as ARIBB24ActivePositionUpToken, a as ARIBB24BellToken, r as ARIBB24BitmapToken, y as ARIBB24BlackForegroundToken, C as ARIBB24BlueForegroundToken, me as ARIBB24BuiltinSoundReplayToken, p as ARIBB24CancelToken, ae as ARIBB24CharacterCompositionDotDesignationToken, j as ARIBB24CharacterSizeControlToken, A as ARIBB24CharacterSizeControlType, e as ARIBB24CharacterToken, u as ARIBB24ClearScreenToken, N as ARIBB24ColorControlBackgroundToken, M as ARIBB24ColorControlForegroundToken, F as ARIBB24ColorControlHalfBackgroundToken, P as ARIBB24ColorControlHalfForegroundToken, B as ARIBB24ConcealmentModeToken, z as ARIBB24ConcealmentModeType, T as ARIBB24CyanForegroundToken, n as ARIBB24DRCSToken, v as ARIBB24DeleteToken, R as ARIBB24FlashingControlToken, L as ARIBB24FlashingControlType, x as ARIBB24GreenForegroundToken, Y as ARIBB24HilightingCharacterBlockToken, w as ARIBB24MagentaForegroundToken, O as ARIBB24MiddleSizeToken, t as ARIBB24MosaicToken, k as ARIBB24NormalSizeToken, i as ARIBB24NullToken, de as ARIBB24OrnamentControlHemmingToken, pe as ARIBB24OrnamentControlHollowToken, ue as ARIBB24OrnamentControlNoneToken, fe as ARIBB24OrnamentControlShadeToken, le as ARIBB24OrnamentControlType, I as ARIBB24PalletControlToken, f as ARIBB24ParameterizedActivePositionForwardToken, K as ARIBB24PatternPolarityControlToken, G as ARIBB24PatternPolarityControlType, he as ARIBB24RasterColourCommandToken, h as ARIBB24RecordSeparatorToken, b as ARIBB24RedForegroundToken, X as ARIBB24RepeatCharacterToken, W as ARIBB24ReplacingConcealmentModeToken, U as ARIBB24ReplacingConcealmentModeType, re as ARIBB24SetDisplayFormatToken, ie as ARIBB24SetDisplayPositionToken, oe as ARIBB24SetHorizontalSpacingToken, se as ARIBB24SetVerticalSpacingToken, ne as ARIBB24SetWritingFormatToken, H as ARIBB24SingleConcealmentModeToken, V as ARIBB24SingleConcealmentModeType, D as ARIBB24SmallSizeToken, _ as ARIBB24SpaceToken, Z as ARIBB24StartLiningToken, Q as ARIBB24StopLiningToken, te as ARIBB24TimeControlModeToken, ee as ARIBB24TimeControlModeType, $ as ARIBB24TimeControlWaitToken, g as ARIBB24UnitSeparatorToken, E as ARIBB24WhiteForegroundToken, J as ARIBB24WritingModeModificationToken, q as ARIBB24WritingModeModificationType, S as ARIBB24YellowForegroundToken };
