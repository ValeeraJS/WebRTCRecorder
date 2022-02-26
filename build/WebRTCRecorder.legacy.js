(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@valeera/blobdownloader')) :
	typeof define === 'function' && define.amd ? define(['@valeera/blobdownloader'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.WebRTCRecorder = factory(global.BlobDownloader));
}(this, (function (BlobDownloader) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var BlobDownloader__default = /*#__PURE__*/_interopDefaultLegacy(BlobDownloader);

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation.

	Permission to use, copy, modify, and/or distribute this software for any
	purpose with or without fee is hereby granted.

	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
	AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
	LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
	OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
	PERFORMANCE OF THIS SOFTWARE.
	***************************************************************************** */

	var __assign = function() {
	    __assign = Object.assign || function __assign(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign.apply(this, arguments);
	};

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
	var DEFAULT_VIDEO_OPTIONS = {
	    codecs: ECodecs.VP8,
	    format: "webm",
	    fps: 60
	};
	var WebRTCRecorder = /** @class */ (function () {
	    function WebRTCRecorder(canvas, options) {
	        var _this = this;
	        if (options === void 0) { options = DEFAULT_VIDEO_OPTIONS; }
	        this.init = function () {
	            _this.mediaSource = new MediaSource();
	            _this.mediaStream = _this.canvas.captureStream(_this.options.fps);
	            return _this;
	        };
	        this.canvas = canvas;
	        this.resetOptions(options);
	    }
	    WebRTCRecorder.prototype.clearSourceBuffer = function () {
	        if (this.mediaSource) {
	            var arr = this.mediaSource.sourceBuffers;
	            for (var i = 0; i < arr.length; i++) {
	                this.mediaSource.removeSourceBuffer(arr[i]);
	            }
	        }
	        return this;
	    };
	    WebRTCRecorder.prototype.clearSteam = function () {
	        if (this.mediaStream) {
	            var arr = this.mediaStream.getTracks();
	            for (var i = 0; i < arr.length; i++) {
	                arr[i].enabled = false;
	                arr[i].stop();
	                this.mediaStream.removeTrack(arr[i]);
	            }
	        }
	        return this;
	    };
	    WebRTCRecorder.prototype.destroy = function () {
	        this.clearSourceBuffer().clearSteam();
	        this.recordedBlobs = [];
	        return this;
	    };
	    WebRTCRecorder.prototype.download = function (fileName) {
	        if (fileName === void 0) { fileName = "untitled_" + new Date().getTime(); }
	        BlobDownloader__default['default'].download(this.getBlob(), fileName);
	        return this;
	    };
	    WebRTCRecorder.prototype.getBlob = function () {
	        return new Blob(this.recordedBlobs, {
	            type: "video/" + this.options.format
	        });
	    };
	    WebRTCRecorder.prototype.getUrl = function () {
	        return window.URL.createObjectURL(this.getBlob());
	    };
	    WebRTCRecorder.prototype.pause = function () {
	        if (this.state === ERecordState.started && this.mediaRecorder) {
	            this.mediaRecorder.pause();
	            this.state = ERecordState.paused;
	        }
	        return this;
	    };
	    WebRTCRecorder.prototype.resetOptions = function (options) {
	        this.options = __assign(__assign({}, DEFAULT_VIDEO_OPTIONS), options);
	        return this.destroy().init();
	    };
	    WebRTCRecorder.prototype.resume = function () {
	        if (this.state === ERecordState.paused && this.mediaRecorder) {
	            this.mediaRecorder.resume();
	            this.state = ERecordState.started;
	        }
	        return this;
	    };
	    WebRTCRecorder.prototype.start = function (ms) {
	        var _this = this;
	        if (ms === void 0) { ms = 100; }
	        this.recordedBlobs = [];
	        this.mediaRecorder = this.mediaRecorder || this.getMediaRecorder();
	        if (!this.mediaRecorder) {
	            this.state = ERecordState.error;
	            return this;
	        }
	        this.mediaRecorder.ondataavailable = function (event) {
	            if (event.data && event.data.size > 0) {
	                _this.recordedBlobs.push(event.data);
	            }
	        };
	        this.mediaRecorder.start(ms);
	        this.state = ERecordState.started;
	        return this;
	    };
	    WebRTCRecorder.prototype.stop = function () {
	        this.state = ERecordState.stopped;
	        if (this.mediaRecorder) {
	            this.mediaRecorder.stop();
	        }
	        return this;
	    };
	    WebRTCRecorder.prototype.toggle = function () {
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
	    WebRTCRecorder.prototype.getMediaRecorder = function () {
	        var _a = this.options, format = _a.format, codecs = _a.codecs;
	        var options1 = {
	            mimeType: "video/" + format + ";codecs=" + codecs
	        };
	        var options2 = {
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
	    WebRTCRecorder.isAvaliable = function (canvas) {
	        return !!MediaSource && !!canvas.captureStream;
	    };
	    return WebRTCRecorder;
	}());

	return WebRTCRecorder;

})));
//# sourceMappingURL=WebRTCRecorder.legacy.js.map
