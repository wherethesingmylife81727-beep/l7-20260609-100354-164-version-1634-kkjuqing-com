(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        if (toggle) {
            toggle.addEventListener("click", function () {
                var open = document.body.classList.toggle("menu-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function startHero() {
            if (slides.length < 2) {
                return;
            }
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var target = Number(dot.getAttribute("data-hero-target") || "0");
                showSlide(target);
                startHero();
            });
        });

        startHero();

        document.querySelectorAll(".search-area").forEach(function (area) {
            var input = area.querySelector(".site-search");
            var chips = Array.prototype.slice.call(area.querySelectorAll(".filter-chip"));
            var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card, .rank-item"));
            var empty = area.querySelector(".empty-state");
            var activeFilter = "all";

            function cardText(card) {
                return [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-tags") || "",
                    card.getAttribute("data-year") || "",
                    card.getAttribute("data-genre") || "",
                    card.getAttribute("data-region") || ""
                ].join(" ").toLowerCase();
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = cardText(card);
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchFilter = activeFilter === "all" || text.indexOf(activeFilter.toLowerCase()) !== -1;
                    var show = matchQuery && matchFilter;
                    card.hidden = !show;
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    activeFilter = chip.getAttribute("data-filter") || "all";
                    chips.forEach(function (item) {
                        item.classList.toggle("is-selected", item === chip);
                    });
                    apply();
                });
            });
        });
    });

    window.initMoviePlayer = function (source) {
        var video = document.querySelector("[data-video-player]");
        var cover = document.querySelector("[data-play]");
        if (!video || !source) {
            return;
        }

        var attached = false;
        var hlsInstance = null;

        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function playVideo() {
            attachSource();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.setAttribute("controls", "controls");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", playVideo);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
