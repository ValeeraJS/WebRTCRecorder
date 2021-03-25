/**
 * @author hypnosnova / https://github.com/HypnosNova
 * @param canvas: the canvas dom element which used webgl context
 * @param options: {
 *     fps: default is 60,
 *     format: default is 'webm',
 *     codecs: default is 'vp8'
 * }
 */

interface CanvasBeta extends HTMLCanvasElement{
	captureStream: (fps: number) => MediaStream
}

export enum ECodecs {
	VP8 = "vp8",
	VP9 = "vp9",
	Opus = "Opus",
	iSAC = 'isac',
	iLBC = "ilbc",
	H264 = "h264"
}

export enum ERecordState {
	error = "error",
	paused = "paused",
	started = "started",
	stopped = "stopped",
}

export type TVideoOptions = {
	fps?: number;
	format?: 'webm'; // webrtc only support webm right now
	codecs?: ECodecs
}

export const DEFAULT_VIDEO_OPTIONS: TVideoOptions = {
	fps: 60,
	format: 'webm',
	codecs: ECodecs.VP8
}

export default class WebRTCRecorder {
	public canvas: HTMLCanvasElement;
	public mediaRecorder: MediaRecorder | false;
	public mediaSource: MediaSource;
	public mediaStream: MediaStream;
	public recordedBlobs: Blob[];
	public state: ERecordState;

	private options: TVideoOptions;
	private linkDom = document.createElement("a");

	static isAvaliable = (canvas: HTMLCanvasElement) => {
		return MediaSource && (canvas as CanvasBeta).captureStream;
	}

	public constructor(canvas: HTMLCanvasElement, options: TVideoOptions = DEFAULT_VIDEO_OPTIONS) {
		this.canvas = canvas;
		this.resetOptions(options);
	}

	public clearSourceBuffer = () => {
		if (this.mediaSource) {
			let arr = this.mediaSource.sourceBuffers;
			for (var i = 0; i < arr.length; i++) {
				this.mediaSource.removeSourceBuffer(arr[i]);
			}
		}
		return this;
	}

	public clearSteam = () => {
		if (this.mediaStream) {
			let arr = this.mediaStream.getTracks();
			for (var i = 0; i < arr.length; i++) {
				arr[i].enabled = false;
				arr[i].stop();
				this.mediaStream.removeTrack(arr[i]);
			}
		}
		return this;
	}

	public destroy = () => {
		this.clearSourceBuffer().clearSteam();
		this.recordedBlobs = [];
		return this;
	}

	public download = (fileName: string = "untitled_" + new Date().getTime()) => {
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
	}

	public getBlob = () => {
		return new Blob(this.recordedBlobs, {
			type: "video/" + this.options.format
		});
	}

	public getUrl = () => {
		return window.URL.createObjectURL(this.getBlob());
	}

	public pause = () => {
		if (this.state === ERecordState.started && this.mediaRecorder) {
			this.mediaRecorder.pause();
			this.state = ERecordState.paused;
		}
		return this;
	}

	public resetOptions = (options: TVideoOptions) => {
		this.options = {
			...DEFAULT_VIDEO_OPTIONS,
			...options
		};
		return this.destroy().init();
	}

	public resume = () => {
		if (this.state === ERecordState.paused && this.mediaRecorder) {
			this.mediaRecorder.resume();
			this.state = ERecordState.started;
		}
		return this;
	}

	public start = (ms: number = 100) => {
		this.recordedBlobs = [];
		this.mediaRecorder = this.mediaRecorder || this.getMediaRecorder();

		if (!this.mediaRecorder) {
			this.state = ERecordState.error;
			return this;
		}

		this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
			if (event.data && event.data.size > 0) {
				this.recordedBlobs.push(event.data);
			}
		};

		this.mediaRecorder.start(ms);
		this.state = ERecordState.started;
		return this;
	}

	public stop = () => {
		this.state = ERecordState.stopped;
		if (this.mediaRecorder) {
			this.mediaRecorder.stop();
		}
		return this;
	}

	public toggle = () => {
		if (this.state === ERecordState.stopped) {
			this.start();
		} else if (this.state === ERecordState.started) {
			this.stop();
		} else if (this.state === ERecordState.paused) {
			this.resume();
		}
		return this;
	}

	private init = () => {
		this.mediaSource = new MediaSource();
		this.mediaStream = (this.canvas as CanvasBeta).captureStream(this.options.fps as number);
		return this;
	}
	
	private getMediaRecorder = (): MediaRecorder | false => {
		const { format, codecs } = this.options;
		const options1 = {
			mimeType: "video/" + format + ";codecs=" + codecs
		};
		const options2 = {
			mimeType: "video/" + format
		};

		if (MediaRecorder.isTypeSupported(options1.mimeType)) {
			return new MediaRecorder(this.mediaStream, options1);
		} else if (MediaRecorder.isTypeSupported(options2.mimeType)) {
			return new MediaRecorder(this.mediaStream, options2);
		} else {
			return false;
		}
	}
}
