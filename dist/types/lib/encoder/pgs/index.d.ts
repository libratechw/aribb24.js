export declare const SegmentType: {
    readonly PDS: 20;
    readonly ODS: 21;
    readonly PCS: 22;
    readonly WDS: 23;
    readonly END: 128;
};
export type CompositionObjectWithCropped = {
    objectId: number;
    windowId: number;
    objectCroppedFlag: true;
    objectHorizontalPosition: number;
    objectVerticalPosition: number;
    objectCroppingHorizontalPosition: number;
    objectCroppingVerticalPosition: number;
    objectCroppingWidth: number;
    objectCroppingHeight: number;
};
export type CompositionObjectWithoutCropped = {
    objectId: number;
    windowId: number;
    objectCroppedFlag: false;
    objectHorizontalPosition: number;
    objectVerticalPosition: number;
};
export type CompositionObject = CompositionObjectWithCropped | CompositionObjectWithoutCropped;
export declare const CompositionObject: {
    into(co: CompositionObject): ArrayBufferLike;
};
export declare const CompositionState: {
    readonly Normal: 0;
    readonly AcquisitionPoint: 64;
    readonly EpochStart: 128;
};
export type PresentationCompositionSegment = {
    width: number;
    height: number;
    frameRate: number;
    compositionNumber: number;
    compositionState: (typeof CompositionState)[keyof typeof CompositionState];
    paletteUpdateFlag: boolean;
    paletteId: number;
    numberOfCompositionObject: number;
    compositionObjects: CompositionObject[];
};
export declare const PresentationCompositionSegment: {
    into(pcs: PresentationCompositionSegment): ArrayBufferLike;
};
export type WindowDefinition = {
    windowId: number;
    windowHorizontalPosition: number;
    windowVerticalPosition: number;
    windowWidth: number;
    windowHeight: number;
};
export declare const WindowDefinition: {
    into(wd: WindowDefinition): ArrayBufferLike;
};
export type WindowDefinitionSegment = {
    numberOfWindow: number;
    windows: WindowDefinition[];
};
export declare const WindowDefinitionSegment: {
    into(wds: WindowDefinitionSegment): ArrayBufferLike;
};
export type PaletteEntry = {
    paletteEntryID: number;
    luminance: number;
    colorDifferenceRed: number;
    colorDifferenceBlue: number;
    transparency: number;
};
export declare const PaletteEntry: {
    into(palette: PaletteEntry): ArrayBufferLike;
};
export type PaletteDefinitionSegment = {
    paletteID: number;
    paletteVersionNumber: number;
    paletteEntries: PaletteEntry[];
};
export declare const PaletteDefinitionSegment: {
    into(pds: PaletteDefinitionSegment): ArrayBufferLike;
};
export declare const SequenceFlag: {
    readonly LastInSequence: 64;
    readonly FirstInSequence: 128;
    readonly FirstAndLastInSequence: 192;
    readonly IntermediateSequence: 0;
};
type ObjectDefinitionSegmentFirstInSequence = {
    objectId: number;
    objectVersionNumber: number;
    lastInSequenceFlag: typeof SequenceFlag.FirstInSequence | typeof SequenceFlag.FirstAndLastInSequence;
    objectDataLength: number;
    width: number;
    height: number;
    objectData: ArrayBuffer;
};
type ObjectDefinitionSegmentOtherSequence = {
    objectId: number;
    objectVersionNumber: number;
    lastInSequenceFlag: typeof SequenceFlag.LastInSequence | typeof SequenceFlag.IntermediateSequence;
    objectData: ArrayBuffer;
};
export type ObjectDefinitionSegment = ObjectDefinitionSegmentFirstInSequence | ObjectDefinitionSegmentOtherSequence;
export declare const ObjectDefinitionSegment: {
    into(ods: ObjectDefinitionSegment): ArrayBufferLike;
};
export type EndSegment = {};
export declare const EndSegment: {
    into(): ArrayBuffer;
};
export declare const encodeSegment: (type: (typeof SegmentType)[keyof typeof SegmentType], data: ArrayBufferLike) => ArrayBufferLike;
export {};
//# sourceMappingURL=index.d.ts.map