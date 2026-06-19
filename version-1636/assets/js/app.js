(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
            button.textContent = open ? "×" : "☰";
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });
        start();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var grid = scope.parentElement.querySelector("[data-card-grid]");
            var cards = grid ? Array.prototype.slice.call(grid.children) : [];
            var search = scope.querySelector("[data-card-search]");
            var year = scope.querySelector("[data-year-filter]");
            var type = scope.querySelector("[data-type-filter]");
            var empty = scope.parentElement.querySelector("[data-empty-state]");
            function apply() {
                var q = search ? search.value.trim().toLowerCase() : "";
                var y = year ? year.value : "";
                var t = type ? type.value : "";
                var shown = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-genre") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-type") || ""
                    ].join(" ").toLowerCase();
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardType = card.getAttribute("data-type") || card.getAttribute("data-genre") || "";
                    var match = (!q || text.indexOf(q) !== -1) && (!y || cardYear === y) && (!t || cardType === t || (card.getAttribute("data-genre") || "") === t);
                    card.classList.toggle("is-filter-hidden", !match);
                    if (match) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", shown === 0);
                }
            }
            [search, year, type].forEach(function (item) {
                if (item) {
                    item.addEventListener("input", apply);
                    item.addEventListener("change", apply);
                }
            });
        });
    }

    function movieCardHtml(movie) {
        var safeTitle = escapeHtml(movie.title);
        return '' +
            '<article class="movie-card">' +
            '<a class="movie-poster" href="' + movie.file + '" aria-label="' + safeTitle + '">' +
            '<img src="' + movie.cover + '" alt="' + safeTitle + '" loading="lazy">' +
            '<span class="movie-year">' + escapeHtml(movie.year) + '</span>' +
            '<span class="movie-play-mark">▶</span>' +
            '</a>' +
            '<div class="movie-card-body">' +
            '<p class="movie-card-meta">' + escapeHtml(movie.region + ' · ' + movie.type + ' · ' + movie.genre) + '</p>' +
            '<h3><a href="' + movie.file + '">' + safeTitle + '</a></h3>' +
            '<p class="movie-card-desc">' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="tag-row">' + movie.tags.slice(0, 6).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>' +
            '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (ch) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[ch];
        });
    }

    function setupSearchPage() {
        var page = document.querySelector("[data-search-page]");
        if (!page || !window.MOVIES_INDEX) {
            return;
        }
        var input = page.querySelector("[data-search-input]");
        var results = page.querySelector("[data-search-results]");
        var note = page.querySelector("[data-search-note]");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (input) {
            input.value = initial;
        }
        function render(query) {
            var q = query.trim().toLowerCase();
            var list = window.MOVIES_INDEX;
            if (q) {
                list = list.filter(function (movie) {
                    return movie.search.indexOf(q) !== -1;
                });
            } else {
                list = list.slice(0, 40);
            }
            if (note) {
                note.textContent = q ? (list.length ? "匹配到的影片" : "暂无匹配影片") : "为你推荐的热门影片";
            }
            if (results) {
                results.innerHTML = list.slice(0, 120).map(movieCardHtml).join("");
            }
        }
        render(initial);
        if (input) {
            input.addEventListener("input", function () {
                render(input.value);
            });
        }
    }

    window.initVideoPlayer = function (videoId, buttonId, sourceUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !button || !sourceUrl) {
            return;
        }
        var attached = false;
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }
        function play() {
            attach();
            button.classList.add("is-hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }
        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                button.classList.remove("is-hidden");
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
}());
