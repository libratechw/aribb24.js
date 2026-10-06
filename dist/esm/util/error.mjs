//#region src/util/error.ts
var e = class extends Error {
	constructor(e, t) {
		super(e, t), this.name = this.constructor.name;
	}
}, t = class extends Error {
	constructor(e, t) {
		super(e, t), this.name = this.constructor.name;
	}
}, n = class extends Error {
	constructor(e, t) {
		super(e, t), this.name = this.constructor.name;
	}
}, r = class extends Error {
	constructor(e, t) {
		super(e, t), this.name = this.constructor.name;
	}
}, i = class extends Error {
	constructor(e, t) {
		super(e, t), this.name = this.constructor.name;
	}
}, a = class extends Error {
	constructor(e, t, n) {
		super(`${t}: ${e}}`, n), this.name = this.constructor.name;
	}
}, o = class extends Error {
	constructor(e, t) {
		super(e, t), this.name = this.constructor.name;
	}
};
//#endregion
export { e as EOFError, a as ExhaustivenessError, t as NotImplementedError, r as NotUsedDueToStandardError, i as UnexpectedFormatError, o as UnreachableError, n as ViolationStandardError };
