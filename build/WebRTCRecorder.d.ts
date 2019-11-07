/**
 * @author hypnosnova / https://github.com/HypnosNova
 * @param canvas: the canvas dom element which used webgl context
 * @param options: {
 *     fps: default is 60,
 *     format: default is 'webm',
 *     codecs: default is 'vp8'
 * }
 */
/// <reference types="dom-mediacapture-record" />
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
export declare type TVideoOptions = {
    fps?: number;
    format?: 'webm';
    codecs?: ECodecs;
};
export declare const DEFAULT_VIDEO_OPTIONS: TVideoOptions;
export default class WebRTCRecorder {
    canvas: HTMLCanvasElement;
    mediaRecorder: MediaRecorder | false;
    mediaSource: MediaSource;
    mediaStream: MediaStream;
    recordedBlobs: Blob[];
    state: ERecordState;
    private options;
    private linkDom;
    static isAvaliable: (canvas: HTMLCanvasElement) => (fps: number) => MediaStream;
    constructor(canvas: HTMLCanvasElement, options?: TVideoOptions);
    clearSourceBuffer: () => this;
    clearSteam: () => this;
    destroy: () => this;
    download: (fileName?: string) => this;
    getBlob: () => Blob;
    getUrl: () => string;
    pause: () => this;
    resetOptions: (options: TVideoOptions) => this;
    resume: () => this;
    start: (ms?: number) => this;
    stop: () => this;
    toggle: () => this;
    private init;
    private getMediaRecorder;
}
