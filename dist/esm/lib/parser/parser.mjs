import { ARIBB24CharacterSizeControlType as e, ARIBB24CharacterToken as t, ARIBB24FlashingControlType as n } from "../tokenizer/token.mjs";
import { ExhaustivenessError as r } from "../../util/error.mjs";
import i from "../../util/crc32.mjs";
//#region src/lib/parser/parser.ts
var a = {
	Small: "Small",
	Middle: "Middle",
	Normal: "Normal",
	Tiny: "Tiny",
	DoubleHeight: "DoubleHeight",
	DoubleWidth: "DoubleWidth",
	DoubleHeightAndWidth: "DoubleHeightAndWidth",
	Special1: "Special1",
	Special2: "Special2"
}, o = new Map([
	[a.Small, [.5, .5]],
	[a.Middle, [.5, 1]],
	[a.Normal, [1, 1]],
	[a.Tiny, [1 / 4, 1 / 6]],
	[a.DoubleHeight, [1, 2]],
	[a.DoubleWidth, [2, 1]],
	[a.DoubleHeightAndWidth, [2, 2]],
	[a.Special1, [NaN, NaN]],
	[a.Special2, [NaN, NaN]]
]), s = { from(e) {
	return {
		magnification: 2,
		...e
	};
} }, c = {
	plane: [960, 540],
	area: [960, 540],
	margin: [0, 0],
	fontsize: [36, 36],
	hspace: 4,
	vspace: 24,
	position: [0, 59],
	size: a.Normal,
	pallet: 0,
	foreground: 7,
	halfforeground: 0,
	halfbackground: 0,
	background: 8,
	underline: !1,
	highlight: 0,
	ornament: null,
	flashing: n.STOP,
	elapsed_time: 0
}, l = { from(e, t, n) {
	return {
		tag: "ClearScreen",
		state: structuredClone(t),
		option: structuredClone(n),
		time: e
	};
} }, u = { from({ character: e, non_spacing: t }, n, r) {
	return {
		tag: "Character",
		state: structuredClone(n),
		option: structuredClone(r),
		character: e,
		non_spacing: t
	};
} }, d = { from({ width: e, height: t, depth: n, binary: r }, i, a) {
	return {
		tag: "DRCS",
		state: structuredClone(i),
		option: structuredClone(a),
		width: e,
		height: t,
		depth: n,
		binary: r
	};
} }, f = {
	from({ x_position: e, y_position: t, flc_colors: n, binary: r }, i, a) {
		return {
			tag: "Bitmap",
			state: structuredClone(i),
			option: structuredClone(a),
			x_position: e,
			y_position: t,
			flc_colors: n,
			binary: r
		};
	},
	toDataURL(e, t) {
		let n = new Uint8Array(e.binary), r = new Set(e.flc_colors), a = n.subarray(0, 33), o = n.subarray(33, n.byteLength), s = new Uint8Array(a.byteLength + o.byteLength + 396 + 140), c = new DataView(s.buffer);
		s.set(a, 0), s.set(o, 569);
		for (let e = 0; e < t.length; e++) {
			let n = t[e], i = Number.parseInt(n.substring(1, 3), 16), a = Number.parseInt(n.substring(3, 5), 16), o = Number.parseInt(n.substring(5, 7), 16), c = Number.parseInt(n.substring(7, 9), 16);
			s[41 + e * 3 + 0] = i, s[41 + e * 3 + 1] = a, s[41 + e * 3 + 2] = o, s[437 + e] = r.has(e) ? 0 : c;
		}
		c.setInt32(33, 384, !1), s[37] = 80, s[38] = 76, s[39] = 84, s[40] = 69, c.setInt32(429, 128, !1), s[433] = 116, s[434] = 82, s[435] = 78, s[436] = 83, c.setInt32(425, i(s, 37, 425), !1), c.setInt32(565, i(s, 433, 565), !1);
		let l = c.getInt32(16, !1), u = c.getInt32(20, !1), d = "data:image/png;base64," + btoa(String.fromCharCode(...s));
		if (r.size === 0) return {
			width: l,
			height: u,
			normal_dataurl: d
		};
		for (let e = 0; e < t.length; e++) {
			let n = t[e], i = Number.parseInt(n.substring(7, 9), 16);
			s[437 + e] = r.has(e) ? i : 0;
		}
		return c.setInt32(425, i(s, 37, 425), !1), c.setInt32(565, i(s, 433, 565), !1), {
			width: l,
			height: u,
			normal_dataurl: d,
			flashing_dataurl: "data:image/png;base64," + btoa(String.fromCharCode(...s))
		};
	}
}, p = class n {
	state;
	option;
	non_spacings = [];
	constructor(e = c, t) {
		this.state = structuredClone(e), this.option = s.from(t), this.state.plane = [this.state.plane[0] * this.option.magnification, this.state.plane[1] * this.option.magnification], this.state.area = [this.state.area[0] * this.option.magnification, this.state.area[1] * this.option.magnification], this.state.margin = [this.state.margin[0] * this.option.magnification, this.state.margin[1] * this.option.magnification], this.state.fontsize = [this.state.fontsize[0] * this.option.magnification, this.state.fontsize[1] * this.option.magnification], this.state.hspace = this.state.hspace * this.option.magnification, this.state.vspace = this.state.vspace * this.option.magnification, this.state.position = [this.state.position[0] * this.option.magnification, this.state.position[1] * this.option.magnification];
	}
	static box(e) {
		return [Math.floor((e.fontsize[0] + e.hspace) * o.get(e.size)[0]), Math.floor((e.fontsize[1] + e.vspace) * o.get(e.size)[1])];
	}
	static offset(e) {
		return [Math.floor(e.hspace * o.get(e.size)[0] / 2), Math.floor(e.vspace * o.get(e.size)[1] / 2)];
	}
	static scale(e) {
		return o.get(e.size);
	}
	move_absolute_dot(e, t) {
		this.state.position[0] = e - this.state.margin[0], this.state.position[1] = t - this.state.margin[1];
	}
	move_absolute_pos(e, t) {
		this.state.position[0] = e * n.box(this.state)[0], this.state.position[1] = (t + 1) * n.box(this.state)[1] - 1 * this.option.magnification;
	}
	move_newline() {
		this.state.position[0] = 0, this.move_relative_pos(0, 1);
	}
	move_relative_pos(e, t) {
		for (; e < 0;) for (this.state.position[0] -= n.box(this.state)[0], e++; this.state.position[0] < 0;) this.state.position[0] += this.state.area[0], t--;
		for (; e > 0;) for (this.state.position[0] += n.box(this.state)[0], e--; this.state.position[0] >= this.state.area[0];) this.state.position[0] -= this.state.area[0], t++;
		for (; t < 0;) this.state.position[1] -= n.box(this.state)[1], t++;
		for (; t > 0;) this.state.position[1] += n.box(this.state)[1], t--;
		for (; this.state.position[1] >= this.state.area[1];) this.state.position[1] -= this.state.area[1];
		for (; this.state.position[1] < 0;) this.state.position[1] += this.state.area[1];
	}
	currentState() {
		return structuredClone(this.state);
	}
	currentOption() {
		return structuredClone(this.option);
	}
	parseToken(n) {
		switch (n.tag) {
			case "Character":
				if (n.non_spacing) this.non_spacings.push(u.from(n, this.state, this.option));
				else {
					let e = [u.from(n, this.state, this.option), ...this.non_spacings];
					return this.non_spacings = [], this.move_relative_pos(1, 0), e;
				}
				break;
			case "DRCS":
				let i = [
					d.from(n, this.state, this.option),
					...n.combining === "" ? [] : [u.from(t.from("　" + n.combining, !0), this.state, this.option)],
					...this.non_spacings
				];
				return this.non_spacings = [], this.move_relative_pos(1, 0), i;
			case "Space": {
				let e = [u.from(t.from("　"), this.state, this.option), ...this.non_spacings];
				return this.non_spacings = [], this.move_relative_pos(1, 0), e;
			}
			case "SetWritingFormat":
				switch (n.format) {
					case 0:
					case 2:
					case 4: break;
					case 5:
						this.state.plane = [1920 * this.option.magnification, 1080 * this.option.magnification];
						break;
					case 7:
						this.state.plane = [960 * this.option.magnification, 540 * this.option.magnification];
						break;
					case 9:
						this.state.plane = [720 * this.option.magnification, 480 * this.option.magnification];
						break;
					case 11:
						this.state.plane = [1280 * this.option.magnification, 720 * this.option.magnification];
						break;
					default: break;
				}
				break;
			case "SetDisplayFormat":
				this.state.area = [n.horizontal * this.option.magnification, n.vertical * this.option.magnification];
				break;
			case "SetDisplayPosition":
				this.state.margin = [n.horizontal * this.option.magnification, n.vertical * this.option.magnification];
				break;
			case "CharacterCompositionDotDesignation":
				this.state.fontsize = [n.horizontal * this.option.magnification, n.vertical * this.option.magnification];
				break;
			case "SetHorizontalSpacing":
				this.state.hspace = n.spacing * this.option.magnification;
				break;
			case "SetVerticalSpacing":
				this.state.vspace = n.spacing * this.option.magnification;
				break;
			case "ActivePositionBackward":
				this.move_relative_pos(-1, 0);
				break;
			case "ActivePositionForward":
				this.move_relative_pos(1, 0);
				break;
			case "ActivePositionDown":
				this.move_relative_pos(0, 1);
				break;
			case "ActivePositionUp":
				this.move_relative_pos(0, -1);
				break;
			case "ActivePositionReturn":
				this.move_newline();
				break;
			case "ParameterizedActivePositionForward":
				this.move_relative_pos(n.x, 0);
				break;
			case "ActivePositionSet":
				this.move_absolute_pos(n.x, n.y);
				break;
			case "ActiveCoordinatePositionSet":
				this.move_absolute_dot(n.x * this.option.magnification, n.y * this.option.magnification);
				break;
			case "SmallSize":
				this.state.size = a.Small;
				break;
			case "MiddleSize":
				this.state.size = a.Middle;
				break;
			case "NormalSize":
				this.state.size = a.Normal;
				break;
			case "CharacterSizeControl":
				switch (n.type) {
					case e.TINY:
						this.state.size = a.Tiny;
						break;
					case e.DOUBLE_HEIGHT:
						this.state.size = a.DoubleHeight;
						break;
					case e.DOUBLE_WIDTH:
						this.state.size = a.DoubleWidth;
						break;
					case e.DOUBLE_HEIGHT_AND_WIDTH:
						this.state.size = a.DoubleHeightAndWidth;
						break;
					case e.SPECIAL_1:
						this.state.size = a.Special1;
						break;
					case e.SPECIAL_2:
						this.state.size = a.Special2;
						break;
					default: throw new r(n, "Unexcepted Size Type in STD-B24 ARIB Caption Content");
				}
				break;
			case "PalletControl":
				this.state.pallet = n.pallet;
				break;
			case "BlackForeground":
				this.state.foreground = this.state.pallet << 4 | 0;
				break;
			case "RedForeground":
				this.state.foreground = this.state.pallet << 4 | 1;
				break;
			case "GreenForeground":
				this.state.foreground = this.state.pallet << 4 | 2;
				break;
			case "YellowForeground":
				this.state.foreground = this.state.pallet << 4 | 3;
				break;
			case "BlueForeground":
				this.state.foreground = this.state.pallet << 4 | 4;
				break;
			case "MagentaForeground":
				this.state.foreground = this.state.pallet << 4 | 5;
				break;
			case "CyanForeground":
				this.state.foreground = this.state.pallet << 4 | 6;
				break;
			case "WhiteForeground":
				this.state.foreground = this.state.pallet << 4 | 7;
				break;
			case "ColorControlForeground":
				this.state.foreground = this.state.pallet << 4 | n.color;
				break;
			case "ColorControlHalfForeground":
				this.state.halfforeground = this.state.pallet << 4 | n.color;
				break;
			case "ColorControlHalfBackground":
				this.state.halfbackground = this.state.pallet << 4 | n.color;
				break;
			case "ColorControlBackground":
				this.state.background = this.state.pallet << 4 | n.color;
				break;
			case "StartLining":
				this.state.underline = !0;
				break;
			case "StopLining":
				this.state.underline = !1;
				break;
			case "HilightingCharacterBlock":
				this.state.highlight = n.enclosure;
				break;
			case "OrnamentControlNone":
				this.state.ornament = null;
				break;
			case "OrnamentControlHemming": {
				let e = Math.floor(n.color / 100), t = n.color % 100;
				this.state.ornament = t << 4 | e;
				break;
			}
			case "FlashingControl":
				this.state.flashing = n.type;
				break;
			case "ClearScreen": return [l.from(this.state.elapsed_time, this.state, this.option)];
			case "TimeControlWait":
				this.state.elapsed_time += n.seconds;
				break;
		}
		return [];
	}
	parse(e) {
		return e.flatMap(this.parseToken.bind(this));
	}
};
//#endregion
export { f as ARIBB24BitmapParsedToken, p as ARIBB24Parser, s as ARIBB24ParserOption, a as ARIBB24_CHARACTER_SIZE, c as initialState };
