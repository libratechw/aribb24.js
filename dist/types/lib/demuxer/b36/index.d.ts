import { ARIBB24CaptionManagement, ARIBB24CaptionStatement } from "../b24/datagroup";
export declare const TimingUnitType: {
    readonly TIME: "T";
    readonly FRAME: "F";
};
export declare const TimeControlModeType: {
    readonly FREE: "FR";
    readonly REALTIME: "RT";
    readonly OFFSETTIME: "OF";
};
export declare const ProgramMaterialType: {
    readonly PROGRAM: "0";
    readonly CM: "1";
    readonly CONTENTS: "2";
    readonly SOUND: "3";
};
export declare const RegistrationModeType: {
    readonly NEW: "N";
    readonly RENEW: "R";
    readonly ADDITION: "A";
    readonly NOT_SPECIFIED: " ";
};
export declare const displayModeType: {
    readonly AUTO_ENABLED: "0";
    readonly AUTO_DISABLED: "1";
    readonly SELECT: "2";
    readonly SELECT_SPECIFIC: "3";
};
export declare const ProgramType: {
    readonly INDEPENDENT: " ";
    readonly COMPLEMENT: "T";
    readonly CAPTION: "C";
};
export declare const RealtimeTimingType: {
    readonly CONTINUOUS_TIMECODE: "TC";
    readonly UNCONTINUOUS_TIMECODE: "TU";
    readonly LAPTIME: "LT";
    readonly JST: "JS";
};
export declare const SyncronizationModeType: {
    readonly ASYNC: "A";
    readonly PROGRAM_SYNC: "P";
    readonly TIME_SYNC: "T";
};
export type ARIBB36ProgramManagementInformation = {
    broadcasterIdentification: string;
    materialNumber: string;
    programTitle: string;
    programSubtitle: string;
    programMaterialType: (typeof ProgramMaterialType)[keyof typeof ProgramMaterialType];
    registrationMode: (typeof RegistrationModeType)[keyof typeof RegistrationModeType];
    languageCode: string;
    displayMode: `${(typeof displayModeType)[keyof typeof displayModeType]}${(typeof displayModeType)[keyof typeof displayModeType]}`;
    programType: (typeof ProgramType)[keyof typeof ProgramType];
    sound: boolean;
    totalPages: number;
    totalBytes: number;
    untime: boolean;
    realtimeTimingType: (typeof RealtimeTimingType)[keyof typeof RealtimeTimingType];
    timingUnitType: (typeof TimingUnitType)[keyof typeof TimingUnitType];
    initialTime: number;
    syncronizationMode: (typeof SyncronizationModeType)[keyof typeof SyncronizationModeType];
    timeControlMode: (typeof TimeControlModeType)[keyof typeof TimeControlModeType];
    extensible: [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];
    compatible: [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];
    expireDate: [number, number, number] | null;
    author: string;
    creationDateTime: [number, number, number, number, number] | null;
    broadcastStartDate: [number, number, number] | null;
    broadcastEndDate: [number, number, number] | null;
    broadcastDaysOfWeek: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
    broadcastStartTime: [number, number, number] | null;
    broadcastEndTime: [number, number, number] | null;
    memo: string;
    completed: boolean;
} & ({
    usersAreaUsed: false;
} | {
    usersAreaUsed: true;
    writingFormatConversionMode: number;
    drcsConversionMode: number;
});
export declare const PageMaterialType: {
    readonly CONTENTS_AND_CM: "0";
    readonly CONTENTS: "1";
    readonly CM: "2";
    readonly SOUND: "3";
};
export declare const DisplayTimingType: {
    readonly REALTIME: "RT";
    readonly DURATIONTIME: "DT";
    readonly UNTIME: "UT";
    readonly NOT_SPECIFIED: "  ";
};
export declare const FormatDensityType: {
    readonly STANDARD: "ST";
    readonly DOUBLE: "DB";
    readonly EUROPEAN: "EL";
    readonly FULLHI: "H2";
    readonly HI: "H1";
    readonly HD: "HD";
    readonly SD: "SD";
    readonly MOBILE: "MB";
};
export declare const FormatWritingModeType: {
    readonly HORIZONTAL: "H";
    readonly VERTICAL: "V";
};
export declare const DisplayAspectRatioType: {
    readonly HD: " ";
    readonly SD: "*";
};
export declare const ScrollType: {
    readonly FIXED: "F";
    readonly SCROLL: "S";
    readonly ROLLUP: "R";
};
export declare const ScrollDirectionType: {
    readonly HORIZONTAL: "H";
    readonly VERTICAL: "V";
};
export type ARIBB36PageManagementInformation = {
    pageNumber: string;
    pageMaterialType: (typeof PageMaterialType)[keyof typeof PageMaterialType];
    displayTimingType: (typeof DisplayTimingType)[keyof typeof DisplayTimingType];
    timingUnitType: (typeof TimingUnitType)[keyof typeof TimingUnitType];
    displayTiming: number;
    clearTiming: number;
    timeControlMode: (typeof TimeControlModeType)[keyof typeof TimeControlModeType];
    clearScreen: boolean;
    displayFormat: `${(typeof FormatDensityType)[keyof typeof FormatDensityType]}${(typeof FormatWritingModeType)[keyof typeof FormatWritingModeType]}`;
    displayAspectRatio: (typeof DisplayAspectRatioType)[keyof typeof DisplayAspectRatioType];
    displayWindowArea: [[number, number], [number, number]] | null;
    scrollType: (typeof ScrollType)[keyof typeof ScrollType];
    scrollDirectionType: (typeof ScrollDirectionType)[keyof typeof ScrollDirectionType];
    sound: boolean;
    pageDataBytes: number;
    deleted: boolean;
    memo: string;
    completed: boolean;
} & ({
    usersAreaUsed: false;
} | {
    usersAreaUsed: true;
    writingFormatConversionMode: number;
    drcsConversionMode: number;
});
export type ARIBB36PageData = ARIBB36PageManagementInformation & ({
    tag: 'ActualPage';
    management: ARIBB24CaptionManagement;
    statement: ARIBB24CaptionStatement;
} | {
    tag: 'ReservedPage';
    pageNumber: '000000';
    management: ARIBB24CaptionManagement;
});
export type ARIBB36Data = ARIBB36ProgramManagementInformation & {
    label: 'DCAPTION' | 'BCAPTION' | 'MCAPTION';
    pages: ARIBB36PageData[];
};
declare const _default: (b36: Uint8Array | ArrayBufferLike) => ARIBB36Data;
export default _default;
//# sourceMappingURL=index.d.ts.map