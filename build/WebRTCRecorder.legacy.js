(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.WebRTCRecorder = factory());
}(this, (function () { 'use strict';

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation. All rights reserved.
	Licensed under the Apache License, Version 2.0 (the "License"); you may not use
	this file except in compliance with the License. You may obtain a copy of the
	License at http://www.apache.org/licenses/LICENSE-2.0

	THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
	WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
	MERCHANTABLITY OR NON-INFRINGEMENT.

	See the Apache Version 2.0 License for specific language governing permissions
	and limitations under the License.
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
	var DEFAULT_VIDEO_OPTIONS = {
	    fps: 60,
	    format: 'webm',
	    codecs: ECodecs.VP8
	};
	var WebRTCRecorder = /** @class */ (function () {
	    function WebRTCRecorder(canvas, options) {
	        var _this = this;
	        if (options === void 0) { options = DEFAULT_VIDEO_OPTIONS; }
	        this.linkDom = document.createElement("a");
	        this.clearSourceBuffer = function () {
	            if (_this.mediaSource) {
	                var arr = _this.mediaSource.sourceBuffers;
	                for (var i = 0; i < arr.length; i++) {
	                    _this.mediaSource.removeSourceBuffer(arr[i]);
	                }
	            }
	            return _this;
	        };
	        this.clearSteam = function () {
	            if (_this.mediaStream) {
	                var arr = _this.mediaStream.getTracks();
	                for (var i = 0; i < arr.length; i++) {
	                    arr[i].enabled = false;
	                    arr[i].stop();
	                    _this.mediaStream.removeTrack(arr[i]);
	                }
	            }
	            return _this;
	        };
	        this.destroy = function () {
	            _this.clearSourceBuffer().clearSteam();
	            _this.recordedBlobs = [];
	            return _this;
	        };
	        this.download = function (fileName) {
	            if (fileName === void 0) { fileName = "untitled_" + new Date().getTime(); }
	            var blob = new Blob(_this.recordedBlobs, { type: "video/" + _this.options.format });
	            var url = window.URL.createObjectURL(blob);
	            var a = _this.linkDom;
	            a.href = url;
	            a.download = fileName + "." + _this.options.format;
	            document.body.appendChild(a);
	            a.click();
	            setTimeout(function () {
	                document.body.removeChild(a);
	                window.URL.revokeObjectURL(url);
	            }, 0);
	            return _this;
	        };
	        this.getBlob = function () {
	            return new Blob(_this.recordedBlobs, {
	                type: "video/" + _this.options.format
	            });
	        };
	        this.getUrl = function () {
	            return window.URL.createObjectURL(_this.getBlob());
	        };
	        this.pause = function () {
	            if (_this.state === ERecordState.started && _this.mediaRecorder) {
	                _this.mediaRecorder.pause();
	                _this.state = ERecordState.paused;
	            }
	            return _this;
	        };
	        this.resetOptions = function (options) {
	            _this.options = __assign(__assign({}, DEFAULT_VIDEO_OPTIONS), options);
	            return _this.destroy().init();
	        };
	        this.resume = function () {
	            if (_this.state === ERecordState.paused && _this.mediaRecorder) {
	                _this.mediaRecorder.resume();
	                _this.state = ERecordState.started;
	            }
	            return _this;
	        };
	        this.start = function (ms) {
	            if (ms === void 0) { ms = 100; }
	            _this.recordedBlobs = [];
	            _this.mediaRecorder = _this.getMediaRecorder();
	            if (!_this.mediaRecorder) {
	                _this.state = ERecordState.error;
	                return _this;
	            }
	            _this.mediaRecorder.ondataavailable = function (event) {
	                if (event.data && event.data.size > 0) {
	                    _this.recordedBlobs.push(event.data);
	                }
	            };
	            _this.mediaRecorder.start(ms);
	            _this.state = ERecordState.started;
	            return _this;
	        };
	        this.stop = function () {
	            _this.state = ERecordState.stopped;
	            if (_this.mediaRecorder) {
	                _this.mediaRecorder.stop();
	            }
	            return _this;
	        };
	        this.toggle = function () {
	            if (_this.state === ERecordState.stopped) {
	                _this.start();
	            }
	            else if (_this.state === ERecordState.started) {
	                _this.stop();
	            }
	            else if (_this.state === ERecordState.paused) {
	                _this.resume();
	            }
	            return _this;
	        };
	        this.init = function () {
	            _this.mediaSource = new MediaSource();
	            _this.mediaStream = _this.canvas.captureStream(_this.options.fps);
	            return _this;
	        };
	        this.getMediaRecorder = function () {
	            var _a = _this.options, format = _a.format, codecs = _a.codecs;
	            var options1 = {
	                mimeType: "video/" + format + ";codecs=" + codecs
	            };
	            var options2 = {
	                mimeType: "video/" + format
	            };
	            if (MediaRecorder.isTypeSupported(options1.mimeType)) {
	                return new MediaRecorder(_this.mediaStream, options1);
	            }
	            else if (MediaRecorder.isTypeSupported(options2.mimeType)) {
	                return new MediaRecorder(_this.mediaStream, options2);
	            }
	            else {
	                return false;
	            }
	        };
	        this.canvas = canvas;
	        this.resetOptions(options);
	    }
	    WebRTCRecorder.isAvaliable = function (canvas) {
	        return MediaSource && canvas.captureStream;
	    };
	    return WebRTCRecorder;
	}());

	return WebRTCRecorder;

})));
