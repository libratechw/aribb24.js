import Feeder, { FeederPresentationData } from './feeder';
export default class SpeechRecognitionFeeder implements Feeder {
    private media;
    private track;
    private recognition;
    private recognitionTime;
    private interim;
    private privious;
    private readonly endedHandler;
    private readonly clearHandler;
    private readonly recognitionEndHandler;
    private readonly recognitionResultHandler;
    constructor(lang?: string);
    attachMedia(media: HTMLVideoElement): void;
    detachMedia(): void;
    private abort;
    private recognitionEnd;
    private recognitionResult;
    private capture;
    clear(): void;
    onAttach(): void;
    onDetach(): void;
    onSeeking(): void;
    destroy(): void;
    prepare(_: number): void;
    content(_: number): FeederPresentationData | null;
}
//# sourceMappingURL=speech-recognition-feeder.d.ts.map