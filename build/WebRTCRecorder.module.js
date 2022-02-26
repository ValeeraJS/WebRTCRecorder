import BlobDownloader from '@valeera/blobdownloader';

var ECodecs;
(function (ECodecs) {
    ECodecs["VP8"] = "vp8";
    ECodecs["VP9"] = "vp9";
    ECodecs["Opus"] = "Opus";
    ECodecs["iSAC"] = "isac";
    ECodecs["iLBC"] = "ilbc";
    ECodecs["H264"] = "h264";
})(ECodecs || (ECodecs = {}));
var ERecordState;
(function (ERecordState) {
    ERecordState["error"] = "error";
    ERecordState["paused"] = "paused";
    ERecordState["started"] = "started";
    ERecordState["stopped"] = "stopped";
})(ERecordState || (ERecordState = {}));
const DEFAULT_VIDEO_OPTIONS = {
    codecs: ECodecs.VP8,
    format: "webm",
    fps: 60
};
class WebRTCRecorder {
    static isAvaliable = (canvas) => {
        return !!MediaSource && !!canvas.captureStream;
    };
    canvas;
    mediaRecorder;
    mediaSource;
    mediaStream;
    recordedBlobs;
    state;
    options;
    constructor(canvas, options = DEFAULT_VIDEO_OPTIONS) {
        this.canvas = canvas;
        this.resetOptions(options);
    }
    clearSourceBuffer() {
        if (this.mediaSource) {
            const arr = this.mediaSource.sourceBuffers;
            for (let i = 0; i < arr.length; i++) {
                this.mediaSource.removeSourceBuffer(arr[i]);
            }
        }
        return this;
    }
    clearSteam() {
        if (this.mediaStream) {
            const arr = this.mediaStream.getTracks();
            for (let i = 0; i < arr.length; i++) {
                arr[i].enabled = false;
                arr[i].stop();
                this.mediaStream.removeTrack(arr[i]);
            }
        }
        return this;
    }
    destroy() {
        this.clearSourceBuffer().clearSteam();
        this.recordedBlobs = [];
        return this;
    }
    download(fileName = "untitled_" + new Date().getTime()) {
        BlobDownloader.download(this.getBlob(), fileName);
        return this;
    }
    getBlob() {
        return new Blob(this.recordedBlobs, {
            type: "video/" + this.options.format
        });
    }
    getUrl() {
        return window.URL.createObjectURL(this.getBlob());
    }
    pause() {
        if (this.state === ERecordState.started && this.mediaRecorder) {
            this.mediaRecorder.pause();
            this.state = ERecordState.paused;
        }
        return this;
    }
    resetOptions(options) {
        this.options = {
            ...DEFAULT_VIDEO_OPTIONS,
            ...options
        };
        return this.destroy().init();
    }
    resume() {
        if (this.state === ERecordState.paused && this.mediaRecorder) {
            this.mediaRecorder.resume();
            this.state = ERecordState.started;
        }
        return this;
    }
    start(ms = 100) {
        this.recordedBlobs = [];
        this.mediaRecorder = this.mediaRecorder || this.getMediaRecorder();
        if (!this.mediaRecorder) {
            this.state = ERecordState.error;
            return this;
        }
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                this.recordedBlobs.push(event.data);
            }
        };
        this.mediaRecorder.start(ms);
        this.state = ERecordState.started;
        return this;
    }
    stop() {
        this.state = ERecordState.stopped;
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
        }
        return this;
    }
    toggle() {
        if (this.state === ERecordState.stopped) {
            this.start();
        }
        else if (this.state === ERecordState.started) {
            this.stop();
        }
        else if (this.state === ERecordState.paused) {
            this.resume();
        }
        return this;
    }
    init = () => {
        this.mediaSource = new MediaSource();
        this.mediaStream = this.canvas.captureStream(this.options.fps);
        return this;
    };
    getMediaRecorder() {
        const { format, codecs } = this.options;
        const options1 = {
            mimeType: "video/" + format + ";codecs=" + codecs
        };
        const options2 = {
            mimeType: "video/" + format
        };
        if (MediaRecorder.isTypeSupported(options1.mimeType)) {
            return new MediaRecorder(this.mediaStream, options1);
        }
        else if (MediaRecorder.isTypeSupported(options2.mimeType)) {
            return new MediaRecorder(this.mediaStream, options2);
        }
        else {
            return false;
        }
    }
}

export { WebRTCRecorder as default };
