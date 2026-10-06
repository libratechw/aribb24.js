//#region src/runtime/common/renderer/svg/renderer-option.ts
var e = { from(e) {
	return {
		font: {
			normal: "'Hiragino Maru Gothic Pro', 'BIZ UDGothic', 'Yu Gothic Medium', sans-serif",
			arib: "'Hiragino Maru Gothic Pro', 'BIZ UDGothic', 'Yu Gothic Medium', sans-serif",
			...e?.font
		},
		replace: {
			half: !0,
			drcs: /* @__PURE__ */ new Map(),
			glyph: /* @__PURE__ */ new Map(),
			...e?.replace
		},
		color: {
			stroke: null,
			foreground: null,
			background: null,
			...e?.color
		},
		animation: {
			pause: !0,
			...e?.animation
		}
	};
} };
//#endregion
export { e as SVGRendererOption };
