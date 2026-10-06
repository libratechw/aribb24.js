import { ByteStream } from "../../../util/bytestream";
export type ARIBB24StatementDataUnit = {
    tag: 'Statement';
    data: Uint8Array;
};
export declare const ARIBB24StatementDataUnit: {
    from(data: Uint8Array): ARIBB24StatementDataUnit;
};
export type ARIBB24DRCSDataUnit = {
    tag: 'DRCS';
    data: Uint8Array;
    bytes: 1 | 2;
};
export declare const ARIBB24DRCSDataUnit: {
    from(data: Uint8Array, bytes: 1 | 2): ARIBB24DRCSDataUnit;
};
export type ARIBB24BitmapDataUnit = {
    tag: 'Bitmap';
    data: Uint8Array;
};
export declare const ARIBB24BitmapDataUnit: {
    from(data: Uint8Array): ARIBB24BitmapDataUnit;
};
export type ARIBB24DataUnit = ARIBB24StatementDataUnit | ARIBB24DRCSDataUnit | ARIBB24BitmapDataUnit;
export declare const DisplayModeType: {
    readonly AUTO_ENABLED: 0;
    readonly AUTO_DISABLED: 1;
    readonly SELECT: 2;
    readonly SELECT_SPECIFIC: 3;
};
export type DisplayModeTypeAll = 0b0000 | 0b0001 | 0b0010 | 0b0011 | 0b0100 | 0b0101 | 0b0110 | 0b0111 | 0b1000 | 0b1001 | 0b1010 | 0b1011 | 0b1100 | 0b1101 | 0b1110 | 0b1111;
export type DisplayModeTypeConditionDesignation = 0b1100 | 0b1101 | 0b1110;
export type DisplayModeAndDisplayConditionDesignation = {
    displayMode: Exclude<DisplayModeTypeAll, DisplayModeTypeConditionDesignation>;
} | {
    displayMode: DisplayModeTypeConditionDesignation;
    displayConditionDesignation: number;
};
export declare const TCSType: {
    readonly JIS8: 0;
    readonly UCS: 1;
    readonly RESERVED1: 2;
    readonly RESERVED2: 3;
};
export declare const RollupModeType: {
    readonly NOT_ROLLUP: 0;
    readonly ROLLUP: 1;
    readonly RESERVED1: 2;
    readonly RESERVED2: 3;
};
export type CaptionManagementLanguageEntry = {
    lang: number;
    iso_639_language_code: string;
    rollup: (typeof RollupModeType)[keyof typeof RollupModeType];
    format: number;
    TCS: (typeof TCSType)[keyof typeof TCSType];
} & DisplayModeAndDisplayConditionDesignation;
export declare const TimeControlModeType: {
    readonly FREE: 0;
    readonly REALTIME: 1;
    readonly OFFSETTIME: 2;
    readonly RESERVED: 3;
};
export type TimeControlModeAndOffsetTime = {
    timeControlMode: Exclude<(typeof TimeControlModeType)[keyof typeof TimeControlModeType], (typeof TimeControlModeType.OFFSETTIME)>;
} | {
    timeControlMode: (typeof TimeControlModeType.OFFSETTIME);
    offsetTime: [number, number, number, number];
};
export type TimeControlModeAndPresentationStartTime = {
    timeControlMode: Exclude<(typeof TimeControlModeType)[keyof typeof TimeControlModeType], (typeof TimeControlModeType.OFFSETTIME) | (typeof TimeControlModeType.REALTIME)>;
} | {
    timeControlMode: (typeof TimeControlModeType.OFFSETTIME) | (typeof TimeControlModeType.REALTIME);
    presentationStartTime: [number, number, number, number];
};
export type ARIBB24CaptionManagement = {
    tag: 'CaptionManagement';
    group: 0 | 1;
    languages: CaptionManagementLanguageEntry[];
    units: ARIBB24DataUnit[];
} & TimeControlModeAndOffsetTime;
export type ARIBB24CaptionStatement = {
    tag: 'CaptionStatement';
    group: 0 | 1;
    lang: number;
    units: ARIBB24DataUnit[];
} & TimeControlModeAndPresentationStartTime;
export type ARIBB24CaptionData = ARIBB24CaptionManagement | ARIBB24CaptionStatement;
export type CaptionAssociationInformation = {
    association: 'ARIB' | 'SBTVD' | 'UNKNOWN';
    language: string;
};
export declare const BCDtoHHMMSSsss: (stream: ByteStream) => [number, number, number, number];
declare const _default: (data: Uint8Array | ArrayBufferLike) => ARIBB24CaptionData | null;
export default _default;
//# sourceMappingURL=datagroup.d.ts.map