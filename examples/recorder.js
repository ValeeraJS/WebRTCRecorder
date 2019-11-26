// this could be used in any webgl demos

function createRecorderAndGUI(canvas) {
    var videoElement = document.createElement("video");
    videoElement.controls = "controls";
    document.body.appendChild(videoElement);
    var recorder = new WebRTCRecorder(canvas);
    var api = {
        "fps": recorder.options.fps,
        "codecs": "vp9",
        "show dom": true,
        "start": recorder.start,
        "stop": () => {
            console.log(recorder.getUrl())
            videoElement.src = recorder.getUrl();
        },
        "pause": recorder.pause,
        "resume": recorder.resume,
        "download": recorder.download
    };

    var gui = new dat.GUI();
    gui.add(api, "fps", 1, 60).step(1).onChange(updateRecorder);
    gui.add(api, "codecs", ["vp9", "vp8", "h264"]).onChange(updateRecorder);
    gui.add(api, "start").onChange(function () {
        startBtn.classList.add("disabled-btn");
        stopBtn.classList.remove("disabled-btn");
        pauseBtn.classList.remove("disabled-btn");
        resumeBtn.classList.add("disabled-btn");
    });
    gui.add(api, "resume").onChange(function () {
        startBtn.classList.add("disabled-btn");
        stopBtn.classList.remove("disabled-btn");
        pauseBtn.classList.remove("disabled-btn");
        resumeBtn.classList.add("disabled-btn");
    });
    gui.add(api, "pause").onChange(function () {
        startBtn.classList.add("disabled-btn");
        stopBtn.classList.remove("disabled-btn");
        pauseBtn.classList.add("disabled-btn");
        resumeBtn.classList.remove("disabled-btn");
    });
    gui.add(api, "stop").onChange(function () {
        startBtn.classList.remove("disabled-btn");
        stopBtn.classList.add("disabled-btn");
        pauseBtn.classList.add("disabled-btn");
        resumeBtn.classList.add("disabled-btn");
    });
    gui.add(api, "show dom").onChange(function (val) {
        videoElement.style.display = val ? "block" : "none";
    });
    gui.add(api, "download");

    var buttons = document.querySelectorAll(".function");
    var startBtn = buttons[0];
    var stopBtn = buttons[3];
    var pauseBtn = buttons[2];
    var resumeBtn = buttons[1];
    stopBtn.classList.add("disabled-btn");
    pauseBtn.classList.add("disabled-btn");
    resumeBtn.classList.add("disabled-btn");

    function updateRecorder() {
        recorder.resetOptions({
            fps: api.fps,
            codecs: api.codecs
        });
    }
}