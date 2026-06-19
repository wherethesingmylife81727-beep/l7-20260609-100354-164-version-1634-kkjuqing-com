import { H as Hls } from "./hls-vendor-dru42stk.js";

function setupPlayer(root) {
    var video = root.querySelector("video");
    var overlay = root.querySelector(".player-cover");
    var startButtons = Array.prototype.slice.call(document.querySelectorAll("[data-player-start]"));
    var stream = video ? video.getAttribute("data-stream") : "";
    var hls = null;
    var started = false;

    async function begin() {
        if (!video || !stream) {
            return;
        }
        if (!started) {
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
            root.classList.add("is-playing");
            if (overlay) {
                overlay.setAttribute("hidden", "hidden");
            }
            video.controls = true;
        }
        try {
            await video.play();
        } catch (error) {
            root.classList.add("is-ready");
        }
    }

    if (overlay) {
        overlay.addEventListener("click", begin);
    }
    if (video) {
        video.addEventListener("click", function () {
            if (!started) {
                begin();
            }
        });
    }
    startButtons.forEach(function (button) {
        button.addEventListener("click", begin);
    });
    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}

document.querySelectorAll("[data-player]").forEach(setupPlayer);
