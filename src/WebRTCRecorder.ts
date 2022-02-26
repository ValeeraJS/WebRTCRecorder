import BlobDownloader from "@valeera/blobdownloader";
/**
 * @author hypnosnova / https://github.com/HypnosNova
 * @param canvas: the canvas dom element
 * @param options: {
 *     fps: default is 60,
 *     format: default is 'webm',
 *     codecs: default is 'vp8'
 * }
 */

interface CanvasBeta extends HTMLCanvasElement {
	captureStream: (fps: number) => MediaStream;
}

export enum ECodecs {
	VP8 = "vp8",
	VP9 = "vp9",
	Opus = "Opus",
	iSAC = "isac",
	iLBC = "ilbc",
	H264 = "h264"
}

export enum ERecordState {
	error = "error",
	paused = "paused",
	started = "started",
	stopped = "stopped"
}

export interface TVideoOptions {
	fps?: number;
	format?: "webm"; // webrtc only support webm right now
	codecs?: ECodecs;
}

export const DEFAULT_VIDEO_OPTIONS: TVideoOptions = {
	codecs: ECodecs.VP8,
	format: "webm",
	fps: 60
};

export default class WebRTCRecorder {
	public static isAvaliable = (canvas: HTMLCanvasElement): boolean => {
		return !!MediaSource && !!(canvas as CanvasBeta).captureStream;
	};

	public canvas: HTMLCanvasElement;
	public mediaRecorder: MediaRecorder | false;
	public mediaSource: MediaSource;
	public mediaStream: MediaStream;
	public recordedBlobs: Blob[];
	public state: ERecordState;

	private options: TVideoOptions;

	public constructor(canvas: HTMLCanvasElement, options: TVideoOptions = DEFAULT_VIDEO_OPTIONS) {
		this.canvas = canvas;
		this.resetOptions(options);
	}

	public clearSourceBuffer(): this {
		if (this.mediaSource) {
			const arr = this.mediaSource.sourceBuffers;

			for (let i = 0; i < arr.length; i++) {
				this.mediaSource.removeSourceBuffer(arr[i]);
			}
		}

		return this;
	}

	public clearSteam(): this {
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

	public destroy(): this {
		this.clearSourceBuffer().clearSteam();
		this.recordedBlobs = [];

		return this;
	}

	public download(fileName: string = "untitled_" + new Date().getTime()): this {
		BlobDownloader.download(this.getBlob(), fileName);

		return this;
	}

	public getBlob(): Blob {
		return new Blob(this.recordedBlobs, {
			type: "video/" + this.options.format
		});
	}

	public getUrl(): string {
		return window.URL.createObjectURL(this.getBlob());
	}

	public pause(): this {
		if (this.state === ERecordState.started && this.mediaRecorder) {
			this.mediaRecorder.pause();
			this.state = ERecordState.paused;
		}

		return this;
	}

	public resetOptions(options: TVideoOptions): this {
		this.options = {
			...DEFAULT_VIDEO_OPTIONS,
			...options
		};

		return this.destroy().init();
	}

	public resume(): this {
		if (this.state === ERecordState.paused && this.mediaRecorder) {
			this.mediaRecorder.resume();
			this.state = ERecordState.started;
		}

		return this;
	}

	public start(ms = 100): this {
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

	public stop(): this {
		this.state = ERecordState.stopped;
		if (this.mediaRecorder) {
			this.mediaRecorder.stop();
		}

		return this;
	}

	public toggle(): this {
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
	};

	private getMediaRecorder(): MediaRecorder | false {
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
