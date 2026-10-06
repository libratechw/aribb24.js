export type ARIBB24CharacterToken = {
    tag: 'Character';
    character: string;
    non_spacing: boolean;
};
export declare const ARIBB24CharacterToken: {
    from(character: string, non_spacing?: boolean): ARIBB24CharacterToken;
};
export type ARIBB24MosaicToken = {
    tag: 'Mosaic';
};
export declare const ARIBB24MosaicToken: {
    from(): ARIBB24MosaicToken;
};
export type ARIBB24DRCSToken = {
    tag: 'DRCS';
    width: number;
    height: number;
    depth: number;
    binary: ArrayBuffer;
    combining: string;
};
export declare const ARIBB24DRCSToken: {
    from(width: number, height: number, depth: number, binary: ArrayBuffer, combining?: string): ARIBB24DRCSToken;
};
export type ARIBB24BitmapToken = {
    tag: 'Bitmap';
    x_position: number;
    y_position: number;
    flc_colors: number[];
    binary: ArrayBuffer;
};
export declare const ARIBB24BitmapToken: {
    from(x_position: number, y_position: number, flc_colors: number[], binary: ArrayBuffer): ARIBB24BitmapToken;
};
export type ARIBB24NullToken = {
    tag: 'Null';
};
export declare const ARIBB24NullToken: {
    from(): ARIBB24NullToken;
};
export type ARIBB24BellToken = {
    tag: 'Bell';
};
export declare const ARIBB24BellToken: {
    from(): ARIBB24BellToken;
};
export type ARIBB24ActivePositionBackwardToken = {
    tag: 'ActivePositionBackward';
};
export declare const ARIBB24ActivePositionBackwardToken: {
    from(): ARIBB24ActivePositionBackwardToken;
};
export type ARIBB24ActivePositionForwardToken = {
    tag: 'ActivePositionForward';
};
export declare const ARIBB24ActivePositionForwardToken: {
    from(): ARIBB24ActivePositionForwardToken;
};
export type ARIBB24ActivePositionDownToken = {
    tag: 'ActivePositionDown';
};
export declare const ARIBB24ActivePositionDownToken: {
    from(): ARIBB24ActivePositionDownToken;
};
export type ARIBB24ActivePositionUpToken = {
    tag: 'ActivePositionUp';
};
export declare const ARIBB24ActivePositionUpToken: {
    from(): ARIBB24ActivePositionUpToken;
};
export type ARIBB24ClearScreenToken = {
    tag: 'ClearScreen';
};
export declare const ARIBB24ClearScreenToken: {
    from(): ARIBB24ClearScreenToken;
};
export type ARIBB24ActivePositionReturnToken = {
    tag: 'ActivePositionReturn';
};
export declare const ARIBB24ActivePositionReturnToken: {
    from(): ARIBB24ActivePositionReturnToken;
};
export type ARIBB24ParameterizedActivePositionForwardToken = {
    tag: 'ParameterizedActivePositionForward';
    x: number;
};
export declare const ARIBB24ParameterizedActivePositionForwardToken: {
    from(x: number): ARIBB24ParameterizedActivePositionForwardToken;
};
export type ARIBB24CancelToken = {
    tag: 'Cancel';
};
export declare const ARIBB24CancelToken: {
    from(): ARIBB24CancelToken;
};
export type ARIBB24ActivePositionSetToken = {
    tag: 'ActivePositionSet';
    x: number;
    y: number;
};
export declare const ARIBB24ActivePositionSetToken: {
    from(x: number, y: number): ARIBB24ActivePositionSetToken;
};
export type ARIBB24RecordSeparatorToken = {
    tag: 'RecordSeparator';
};
export declare const ARIBB24RecordSeparatorToken: {
    from(): ARIBB24RecordSeparatorToken;
};
export type ARIBB24UnitSeparatorToken = {
    tag: 'UnitSeparator';
};
export declare const ARIBB24UnitSeparatorToken: {
    from(): ARIBB24UnitSeparatorToken;
};
export type ARIBB24SpaceToken = {
    tag: 'Space';
};
export declare const ARIBB24SpaceToken: {
    from(): ARIBB24SpaceToken;
};
export type ARIBB24DeleteToken = {
    tag: 'Delete';
};
export declare const ARIBB24DeleteToken: {
    from(): ARIBB24DeleteToken;
};
export type ARIBB24BlackForegroundToken = {
    tag: 'BlackForeground';
};
export declare const ARIBB24BlackForegroundToken: {
    from(): ARIBB24BlackForegroundToken;
};
export type ARIBB24RedForegroundToken = {
    tag: 'RedForeground';
};
export declare const ARIBB24RedForegroundToken: {
    from(): ARIBB24RedForegroundToken;
};
export type ARIBB24GreenForegroundToken = {
    tag: 'GreenForeground';
};
export declare const ARIBB24GreenForegroundToken: {
    from(): ARIBB24GreenForegroundToken;
};
export type ARIBB24YellowForegroundToken = {
    tag: 'YellowForeground';
};
export declare const ARIBB24YellowForegroundToken: {
    from(): ARIBB24YellowForegroundToken;
};
export type ARIBB24BlueForegroundToken = {
    tag: 'BlueForeground';
};
export declare const ARIBB24BlueForegroundToken: {
    from(): ARIBB24BlueForegroundToken;
};
export type ARIBB24MagentaForegroundToken = {
    tag: 'MagentaForeground';
};
export declare const ARIBB24MagentaForegroundToken: {
    from(): ARIBB24MagentaForegroundToken;
};
export type ARIBB24CyanForegroundToken = {
    tag: 'CyanForeground';
};
export declare const ARIBB24CyanForegroundToken: {
    from(): ARIBB24CyanForegroundToken;
};
export type ARIBB24WhiteForegroundToken = {
    tag: 'WhiteForeground';
};
export declare const ARIBB24WhiteForegroundToken: {
    from(): ARIBB24WhiteForegroundToken;
};
export type ARIBB24SmallSizeToken = {
    tag: 'SmallSize';
};
export declare const ARIBB24SmallSizeToken: {
    from(): ARIBB24SmallSizeToken;
};
export type ARIBB24MiddleSizeToken = {
    tag: 'MiddleSize';
};
export declare const ARIBB24MiddleSizeToken: {
    from(): ARIBB24MiddleSizeToken;
};
export type ARIBB24NormalSizeToken = {
    tag: 'NormalSize';
};
export declare const ARIBB24NormalSizeToken: {
    from(): ARIBB24NormalSizeToken;
};
export declare const ARIBB24CharacterSizeControlType: {
    readonly TINY: 96;
    readonly DOUBLE_HEIGHT: 65;
    readonly DOUBLE_WIDTH: 68;
    readonly DOUBLE_HEIGHT_AND_WIDTH: 69;
    readonly SPECIAL_1: 107;
    readonly SPECIAL_2: 100;
};
export type ARIBB24CharacterSizeControlToken = {
    tag: 'CharacterSizeControl';
    type: (typeof ARIBB24CharacterSizeControlType)[keyof typeof ARIBB24CharacterSizeControlType];
};
export declare const ARIBB24CharacterSizeControlToken: {
    from(type: (typeof ARIBB24CharacterSizeControlType)[keyof typeof ARIBB24CharacterSizeControlType]): ARIBB24CharacterSizeControlToken;
};
export type ARIBB24ColorControlForegroundToken = {
    tag: 'ColorControlForeground';
    color: number;
};
export declare const ARIBB24ColorControlForegroundToken: {
    from(color: number): ARIBB24ColorControlForegroundToken;
};
export type ARIBB24ColorControlBackgroundToken = {
    tag: 'ColorControlBackground';
    color: number;
};
export declare const ARIBB24ColorControlBackgroundToken: {
    from(color: number): ARIBB24ColorControlBackgroundToken;
};
export type ARIBB24ColorControlHalfForegroundToken = {
    tag: 'ColorControlHalfForeground';
    color: number;
};
export declare const ARIBB24ColorControlHalfForegroundToken: {
    from(color: number): ARIBB24ColorControlHalfForegroundToken;
};
export type ARIBB24ColorControlHalfBackgroundToken = {
    tag: 'ColorControlHalfBackground';
    color: number;
};
export declare const ARIBB24ColorControlHalfBackgroundToken: {
    from(color: number): ARIBB24ColorControlHalfBackgroundToken;
};
export type ARIBB24PalletControlToken = {
    tag: 'PalletControl';
    pallet: number;
};
export declare const ARIBB24PalletControlToken: {
    from(pallet: number): ARIBB24PalletControlToken;
};
export declare const ARIBB24FlashingControlType: {
    readonly NORMAL: 64;
    readonly INVERTED: 71;
    readonly STOP: 79;
};
export type ARIBB24FlashingControlToken = {
    tag: 'FlashingControl';
    type: (typeof ARIBB24FlashingControlType)[keyof typeof ARIBB24FlashingControlType];
};
export declare const ARIBB24FlashingControlToken: {
    from(type: (typeof ARIBB24FlashingControlType)[keyof typeof ARIBB24FlashingControlType]): ARIBB24FlashingControlToken;
};
export declare const ARIBB24ConcealmentModeType: {
    readonly STOP: 79;
};
export type ARIBB24ConcealmentModeToken = {
    tag: 'ConcealmentMode';
    type: (typeof ARIBB24ConcealmentModeType)[keyof typeof ARIBB24ConcealmentModeType];
};
export declare const ARIBB24ConcealmentModeToken: {
    from(type: (typeof ARIBB24ConcealmentModeType)[keyof typeof ARIBB24ConcealmentModeType]): ARIBB24ConcealmentModeToken;
};
export declare const ARIBB24SingleConcealmentModeType: {
    readonly START: 64;
};
export type ARIBB24SingleConcealmentModeToken = {
    tag: 'SingleConcealmentMode';
    type: (typeof ARIBB24SingleConcealmentModeType)[keyof typeof ARIBB24SingleConcealmentModeType];
};
export declare const ARIBB24SingleConcealmentModeToken: {
    from(type: (typeof ARIBB24SingleConcealmentModeType)[keyof typeof ARIBB24SingleConcealmentModeType]): ARIBB24SingleConcealmentModeToken;
};
export declare const ARIBB24ReplacingConcealmentModeType: {
    readonly START: 64;
    readonly FIRST: 65;
    readonly SECOND: 66;
    readonly THIRD: 67;
    readonly FOURTH: 68;
    readonly FIFTH: 69;
    readonly SIXTH: 70;
    readonly SEVENTH: 71;
    readonly EIGHTH: 72;
    readonly NINTH: 73;
    readonly TENTH: 74;
};
export type ARIBB24ReplacingConcealmentModeToken = {
    tag: 'ReplacingConcealmentMode';
    type: (typeof ARIBB24ReplacingConcealmentModeType)[keyof typeof ARIBB24ReplacingConcealmentModeType];
};
export declare const ARIBB24ReplacingConcealmentModeToken: {
    from(type: (typeof ARIBB24ReplacingConcealmentModeType)[keyof typeof ARIBB24ReplacingConcealmentModeType]): ARIBB24ReplacingConcealmentModeToken;
};
export declare const ARIBB24PatternPolarityControlType: {
    readonly NORMAL: 64;
    readonly INVERTED_1: 65;
    readonly INVERTED_2: 66;
};
export type ARIBB24PatternPolarityControlToken = {
    tag: 'PatternPolarityControl';
    type: (typeof ARIBB24PatternPolarityControlType)[keyof typeof ARIBB24PatternPolarityControlType];
};
export declare const ARIBB24PatternPolarityControlToken: {
    from(type: (typeof ARIBB24PatternPolarityControlType)[keyof typeof ARIBB24PatternPolarityControlType]): ARIBB24PatternPolarityControlToken;
};
export declare const ARIBB24WritingModeModificationType: {
    readonly BOTH: 64;
    readonly FOREGROUND: 68;
    readonly BACKGROUND: 69;
};
export type ARIBB24WritingModeModificationToken = {
    tag: 'WritingModeModification';
    type: (typeof ARIBB24WritingModeModificationType)[keyof typeof ARIBB24WritingModeModificationType];
};
export declare const ARIBB24WritingModeModificationToken: {
    from(type: (typeof ARIBB24WritingModeModificationType)[keyof typeof ARIBB24WritingModeModificationType]): ARIBB24WritingModeModificationToken;
};
export type ARIBB24HilightingCharacterBlockToken = {
    tag: 'HilightingCharacterBlock';
    enclosure: number;
};
export declare const ARIBB24HilightingCharacterBlockToken: {
    from(enclosure: number): ARIBB24HilightingCharacterBlockToken;
};
export type ARIBB24RepeatCharacterToken = {
    tag: 'RepeatCharacter';
    repeat: number;
};
export declare const ARIBB24RepeatCharacterToken: {
    from(repeat: number): ARIBB24RepeatCharacterToken;
};
export type ARIBB24StartLiningToken = {
    tag: 'StartLining';
};
export declare const ARIBB24StartLiningToken: {
    from(): ARIBB24StartLiningToken;
};
export type ARIBB24StopLiningToken = {
    tag: 'StopLining';
};
export declare const ARIBB24StopLiningToken: {
    from(): ARIBB24StopLiningToken;
};
export type ARIBB24TimeControlWaitToken = {
    tag: 'TimeControlWait';
    seconds: number;
};
export declare const ARIBB24TimeControlWaitToken: {
    from(seconds: number): ARIBB24TimeControlWaitToken;
};
export declare const ARIBB24TimeControlModeType: {
    readonly FREE: 64;
    readonly REAL: 65;
    readonly OFFSET: 66;
    readonly UNIQUE: 67;
};
export type ARIBB24TimeControlModeToken = {
    tag: 'TimeControlMode';
    type: (typeof ARIBB24TimeControlModeType)[keyof typeof ARIBB24TimeControlModeType];
};
export declare const ARIBB24TimeControlModeToken: {
    from(type: (typeof ARIBB24TimeControlModeType)[keyof typeof ARIBB24TimeControlModeType]): ARIBB24TimeControlModeToken;
};
export type ARIBB24SetWritingFormatToken = {
    tag: 'SetWritingFormat';
    format: number;
};
export declare const ARIBB24SetWritingFormatToken: {
    from(format: number): ARIBB24SetWritingFormatToken;
};
export type ARIBB24SetDisplayFormatToken = {
    tag: 'SetDisplayFormat';
    horizontal: number;
    vertical: number;
};
export declare const ARIBB24SetDisplayFormatToken: {
    from(horizontal: number, vertical: number): ARIBB24SetDisplayFormatToken;
};
export type ARIBB24SetDisplayPositionToken = {
    tag: 'SetDisplayPosition';
    horizontal: number;
    vertical: number;
};
export declare const ARIBB24SetDisplayPositionToken: {
    from(horizontal: number, vertical: number): ARIBB24SetDisplayPositionToken;
};
export type ARIBB24CharacterCompositionDotDesignationToken = {
    tag: 'CharacterCompositionDotDesignation';
    horizontal: number;
    vertical: number;
};
export declare const ARIBB24CharacterCompositionDotDesignationToken: {
    from(horizontal: number, vertical: number): ARIBB24CharacterCompositionDotDesignationToken;
};
export type ARIBB24SetHorizontalSpacingToken = {
    tag: 'SetHorizontalSpacing';
    spacing: number;
};
export declare const ARIBB24SetHorizontalSpacingToken: {
    from(spacing: number): ARIBB24SetHorizontalSpacingToken;
};
export type ARIBB24SetVerticalSpacingToken = {
    tag: 'SetVerticalSpacing';
    spacing: number;
};
export declare const ARIBB24SetVerticalSpacingToken: {
    from(spacing: number): ARIBB24SetVerticalSpacingToken;
};
export type ARIBB24ActiveCoordinatePositionSetToken = {
    tag: 'ActiveCoordinatePositionSet';
    x: number;
    y: number;
};
export declare const ARIBB24ActiveCoordinatePositionSetToken: {
    from(x: number, y: number): ARIBB24ActiveCoordinatePositionSetToken;
};
export declare const ARIBB24OrnamentControlType: {
    readonly NONE: 0;
    readonly HEMMING: 1;
    readonly SHADE: 2;
    readonly HOLLOW: 3;
};
export type ARIBB24OrnamentControlNoneToken = {
    tag: 'OrnamentControlNone';
};
export declare const ARIBB24OrnamentControlNoneToken: {
    from(): ARIBB24OrnamentControlNoneToken;
};
export type ARIBB24OrnamentControlHemmingToken = {
    tag: 'OrnamentControlHemming';
    color: number;
};
export declare const ARIBB24OrnamentControlHemmingToken: {
    from(color: number): ARIBB24OrnamentControlHemmingToken;
};
export type ARIBB24OrnamentControlShadeToken = {
    tag: 'OrnamentControlShade';
    color: number;
};
export declare const ARIBB24OrnamentControlShadeToken: {
    from(color: number): ARIBB24OrnamentControlShadeToken;
};
export type ARIBB24OrnamentControlHollowToken = {
    tag: 'OrnamentControlHollow';
};
export declare const ARIBB24OrnamentControlHollowToken: {
    from(): ARIBB24OrnamentControlHollowToken;
};
export type ARIBB24BuiltinSoundReplayToken = {
    tag: 'BuiltinSoundReplay';
    sound: number;
};
export declare const ARIBB24BuiltinSoundReplayToken: {
    from(sound: number): ARIBB24BuiltinSoundReplayToken;
};
export type ARIBB24RasterColourCommandToken = {
    tag: 'RasterColourCommand';
    color: number;
};
export declare const ARIBB24RasterColourCommandToken: {
    from(color: number): ARIBB24RasterColourCommandToken;
};
export type ARIBB24Token = ARIBB24BitmapToken | ARIBB24CharacterToken | ARIBB24MosaicToken | ARIBB24DRCSToken | ARIBB24NullToken | ARIBB24BellToken | ARIBB24ActivePositionBackwardToken | ARIBB24ActivePositionForwardToken | ARIBB24ActivePositionDownToken | ARIBB24ActivePositionUpToken | ARIBB24ClearScreenToken | ARIBB24ActivePositionReturnToken | ARIBB24ParameterizedActivePositionForwardToken | ARIBB24CancelToken | ARIBB24ActivePositionSetToken | ARIBB24RecordSeparatorToken | ARIBB24UnitSeparatorToken | ARIBB24SpaceToken | ARIBB24DeleteToken | ARIBB24BlackForegroundToken | ARIBB24RedForegroundToken | ARIBB24GreenForegroundToken | ARIBB24YellowForegroundToken | ARIBB24BlueForegroundToken | ARIBB24MagentaForegroundToken | ARIBB24CyanForegroundToken | ARIBB24WhiteForegroundToken | ARIBB24SmallSizeToken | ARIBB24MiddleSizeToken | ARIBB24NormalSizeToken | ARIBB24CharacterSizeControlToken | ARIBB24ColorControlForegroundToken | ARIBB24ColorControlBackgroundToken | ARIBB24ColorControlHalfForegroundToken | ARIBB24ColorControlHalfBackgroundToken | ARIBB24PalletControlToken | ARIBB24FlashingControlToken | ARIBB24ConcealmentModeToken | ARIBB24SingleConcealmentModeToken | ARIBB24ReplacingConcealmentModeToken | ARIBB24PatternPolarityControlToken | ARIBB24WritingModeModificationToken | ARIBB24HilightingCharacterBlockToken | ARIBB24RepeatCharacterToken | ARIBB24StartLiningToken | ARIBB24StopLiningToken | ARIBB24TimeControlWaitToken | ARIBB24TimeControlModeToken | ARIBB24SetWritingFormatToken | ARIBB24SetDisplayFormatToken | ARIBB24SetDisplayPositionToken | ARIBB24CharacterCompositionDotDesignationToken | ARIBB24SetHorizontalSpacingToken | ARIBB24SetVerticalSpacingToken | ARIBB24ActiveCoordinatePositionSetToken | ARIBB24OrnamentControlNoneToken | ARIBB24OrnamentControlHemmingToken | ARIBB24OrnamentControlShadeToken | ARIBB24OrnamentControlHollowToken | ARIBB24BuiltinSoundReplayToken | ARIBB24RasterColourCommandToken;
//# sourceMappingURL=token.d.ts.map