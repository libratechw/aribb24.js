//#region src/runtime/common/renderer/canvas/renderer-option.ts
var e = { from(e) {
	return {
		font: {
			normal: "'Hiragino Maru Gothic Pro', 'BIZ UDGothic', 'Yu Gothic Medium', sans-serif",
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
		resize: {
			target: "container",
			objectFit: "contain",
			...e?.resize
		}
	};
} };
//#endregion
export { e as CanvasRendererOption };
