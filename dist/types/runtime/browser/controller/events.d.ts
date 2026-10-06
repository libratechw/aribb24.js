export declare const EventType: {
    readonly BuiltinSound: "BuiltinSound";
};
export type BuiltinSound = {
    event: typeof EventType.BuiltinSound;
    sound: number;
};
export declare const BuiltinSound: {
    from(sound: number): BuiltinSound;
};
export type Event = {
    [EventType.BuiltinSound]: BuiltinSound;
};
//# sourceMappingURL=events.d.ts.map