(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.WebRTCRecorder = factory());
}(this, (function () { 'use strict';

	/**
	 * @author hypnosnova / https://github.com/HypnosNova
	 * @param canvas: the canvas dom element which used webgl context
	 * @param options: {
	 *     fps: default is 60,
	 *     format: default is 'webm',
	 *     codecs: default is 'vp8'
	 * }
	 */
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
	    fps: 60,
	    format: 'webm',
	    codecs: ECodecs.VP8
	};
	class WebRTCRecorder {
	    constructor(canvas, options = DEFAULT_VIDEO_OPTIONS) {
	        this.linkDom = document.createElement("a");
	        this.clearSourceBuffer = () => {
	            if (this.mediaSource) {
	                let arr = this.mediaSource.sourceBuffers;
	                for (var i = 0; i < arr.length; i++) {
	                    this.mediaSource.removeSourceBuffer(arr[i]);
	                }
	            }
	            return this;
	        };
	        this.clearSteam = () => {
	            if (this.mediaStream) {
	                let arr = this.mediaStream.getTracks();
	                for (var i = 0; i < arr.length; i++) {
	                    arr[i].enabled = false;
	                    arr[i].stop();
	                    this.mediaStream.removeTrack(arr[i]);
	                }
	            }
	            return this;
	        };
	        this.destroy = () => {
	            this.clearSourceBuffer().clearSteam();
	            this.recordedBlobs = [];
	            return this;
	        };
	        this.download = (fileName = "untitled_" + new Date().getTime()) => {
	            const blob = new Blob(this.recordedBlobs, { type: "video/" + this.options.format });
	            const url = window.URL.createObjectURL(blob);
	            const a = this.linkDom;
	            a.href = url;
	            a.download = fileName + "." + this.options.format;
	            document.body.appendChild(a);
	            a.click();
	            setTimeout(() => {
	                document.body.removeChild(a);
	                window.URL.revokeObjectURL(url);
	            }, 0);
	            return this;
	        };
	        this.getBlob = () => {
	            return new Blob(this.recordedBlobs, {
	                type: "video/" + this.options.format
	            });
	        };
	        this.getUrl = () => {
	            return window.URL.createObjectURL(this.getBlob());
	        };
	        this.pause = () => {
	            if (this.state === ERecordState.started && this.mediaRecorder) {
	                this.mediaRecorder.pause();
	                this.state = ERecordState.paused;
	            }
	            return this;
	        };
	        this.resetOptions = (options) => {
	            this.options = {
	                ...DEFAULT_VIDEO_OPTIONS,
	                ...options
	            };
	            return this.destroy().init();
	        };
	        this.resume = () => {
	            if (this.state === ERecordState.paused && this.mediaRecorder) {
	                this.mediaRecorder.resume();
	                this.state = ERecordState.started;
	            }
	            return this;
	        };
	        this.start = (ms = 100) => {
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
	        };
	        this.stop = () => {
	            this.state = ERecordState.stopped;
	            if (this.mediaRecorder) {
	                this.mediaRecorder.stop();
	            }
	            return this;
	        };
	        this.toggle = () => {
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
	        };
	        this.init = () => {
	            this.mediaSource = new MediaSource();
	            this.mediaStream = this.canvas.captureStream(this.options.fps);
	            return this;
	        };
	        this.getMediaRecorder = () => {
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
	        };
	        this.canvas = canvas;
	        this.resetOptions(options);
	    }
	}
	WebRTCRecorder.isAvaliable = (canvas) => {
	    return MediaSource && canvas.captureStream;
	};

	return WebRTCRecorder;

})));
//# sourceMappingURL=WebRTCRecorder.js.map
