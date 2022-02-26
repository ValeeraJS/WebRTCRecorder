export declare enum ECodecs {
    VP8 = "vp8",
    VP9 = "vp9",
    Opus = "Opus",
    iSAC = "isac",
    iLBC = "ilbc",
    H264 = "h264"
}
export declare enum ERecordState {
    error = "error",
    paused = "paused",
    started = "started",
    stopped = "stopped"
}
export interface TVideoOptions {
    fps?: number;
    format?: "webm";
    codecs?: ECodecs;
}
export declare const DEFAULT_VIDEO_OPTIONS: TVideoOptions;
export default class WebRTCRecorder {
    static isAvaliable: (canvas: HTMLCanvasElement) => boolean;
    canvas: HTMLCanvasElement;
    mediaRecorder: MediaRecorder | false;
    mediaSource: MediaSource;
    mediaStream: MediaStream;
    recordedBlobs: Blob[];
    state: ERecordState;
    private options;
    constructor(canvas: HTMLCanvasElement, options?: TVideoOptions);
    clearSourceBuffer(): this;
    clearSteam(): this;
    destroy(): this;
    download(fileName?: string): this;
    getBlob(): Blob;
    getUrl(): string;
    pause(): this;
    resetOptions(options: TVideoOptions): this;
    resume(): this;
    start(ms?: number): this;
    stop(): this;
    toggle(): this;
    private init;
    private getMediaRecorder;
}
