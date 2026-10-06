import { ARIBB24CharacterToken as e } from "../../../tokenizer/token.mjs";
import { NotImplementedError as t } from "../../../../util/error.mjs";
import n from "../../../../util/md5.mjs";
import { ARIBB24DRCSDataUnit as r, ARIBB24StatementDataUnit as i } from "../../../demuxer/b24/datagroup.mjs";
import a from "../encoder.mjs";
import o from "../../../../util/concat.mjs";
//#region src/lib/encoder/b24/ucs/index.ts
var s = class extends a {
	current_drcs_code = 60416;
	drcs_units = [];
	drcs_md5_to_code = /* @__PURE__ */ new Map();
	encoder = new TextEncoder();
	encodeCharacter({ character: e }) {
		return this.encoder.encode(e).buffer;
	}
	encode(e) {
		let t = o(...e.map(this.encodeTokenHandler));
		return [...this.drcs_units, i.from(new Uint8Array(t))];
	}
	encodeControl(e) {
		switch (e.tag) {
			case "Null":
			case "Bell":
			case "ActivePositionBackward":
			case "ActivePositionForward":
			case "ActivePositionDown":
			case "ActivePositionUp":
			case "ClearScreen":
			case "ActivePositionReturn":
			case "ParameterizedActivePositionForward":
			case "Cancel":
			case "ActivePositionSet":
			case "RecordSeparator":
			case "UnitSeparator":
			case "Space":
			case "Delete": return super.encodeControl(e);
			default: return o(Uint8Array.from([194]).buffer, super.encodeControl(e));
		}
	}
	encodeDRCS(t) {
		let i = n(t.binary);
		if (!this.drcs_md5_to_code.has(i)) {
			if (this.current_drcs_code > 63743) return this.encoder.encode("〓").buffer;
			let e = Uint8Array.from([
				1,
				(this.current_drcs_code & 65280) >> 8,
				(this.current_drcs_code & 255) >> 0,
				1,
				0,
				2 ** t.depth - 2,
				t.width,
				t.height
			]).buffer;
			this.drcs_units.push(r.from(new Uint8Array(o(e, t.binary)), 2)), this.drcs_md5_to_code.set(i, this.current_drcs_code), this.current_drcs_code++;
		}
		let a = this.drcs_md5_to_code.get(i);
		return t.combining === "" ? this.encoder.encode(String.fromCodePoint(a)).buffer : o(this.encoder.encode(String.fromCodePoint(a)).buffer, this.encodeCharacter(e.from(t.combining)));
	}
	encodeBitmap(e) {
		throw new t("Bitmap is Not Implemented");
	}
	encodeMosaic(e) {
		throw new t("Mozaic Character is Not Implemented");
	}
};
//#endregion
export { s as default };
