(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.BlobDownloader = factory());
}(this, (function () { 'use strict';

	/**
	 * @author hypnosnova / https://github.com/HypnosNova
	 */
	class BlobDownloader {
	    constructor(urlOrBlob, fileName) {
	        this.state = BlobDownloader.State.NONE;
	        this.link = document.createElement("a");
	        if (urlOrBlob) {
	            this.update(urlOrBlob, fileName);
	        }
	    }
	    static async download(url, defaultName) {
	        const ins = BlobDownloader.instance;
	        await ins.update(url);
	        return ins.download(defaultName);
	    }
	    async update(urlOrBlob, fileName) {
	        this.link.download = fileName || "download";
	        this.state = BlobDownloader.State.PROGRESSING;
	        if (typeof urlOrBlob === "string") {
	            return fetch(urlOrBlob)
	                .then((res) => {
	                return res.blob();
	            })
	                .then((blob) => {
	                this.setBlob(blob);
	                return this;
	            })
	                .catch((error) => {
	                this.state = BlobDownloader.State.ERROR;
	                console.error(error);
	                return this;
	            });
	        }
	        else {
	            return Promise.resolve(this.setBlob(urlOrBlob));
	        }
	    }
	    download(fileName) {
	        if (fileName) {
	            this.link.download = fileName;
	        }
	        if (this.state === BlobDownloader.State.READY) {
	            this.link.click();
	        }
	        else {
	            console.error("The file is not ready yet.");
	        }
	        return this;
	    }
	    setBlob(blob) {
	        this.state = BlobDownloader.State.READY;
	        this.blob = blob;
	        this.blobUrl = URL.createObjectURL(blob);
	        this.link.href = this.blobUrl;
	        return this;
	    }
	}
	BlobDownloader.State = {
	    ERROR: -1,
	    NONE: 0,
	    PROGRESSING: 2,
	    READY: 1
	};
	BlobDownloader.instance = new BlobDownloader();

	return BlobDownloader;

})));
//# sourceMappingURL=BlobDownloader.js.map
