(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        if (menuButton) {
            menuButton.addEventListener("click", function () {
                document.body.classList.toggle("nav-open");
            });
        }

        document.querySelectorAll("[data-mobile-nav] a").forEach(function (link) {
            link.addEventListener("click", function () {
                document.body.classList.remove("nav-open");
            });
        });

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var active = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, itemIndex) {
                    slide.classList.toggle("is-active", itemIndex === active);
                });
                dots.forEach(function (dot, itemIndex) {
                    dot.classList.toggle("is-active", itemIndex === active);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(active + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        });

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var reset = scope.querySelector("[data-filter-reset]");
            var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function apply() {
                var q = normalize(input ? input.value : "");
                var filters = {};
                selects.forEach(function (select) {
                    filters[select.getAttribute("data-filter-select")] = normalize(select.value);
                });
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var year = normalize(card.getAttribute("data-year"));
                    var type = normalize(card.getAttribute("data-type"));
                    var genre = normalize(card.getAttribute("data-genre"));
                    var visible = true;
                    if (q && text.indexOf(q) === -1) {
                        visible = false;
                    }
                    if (filters.year && year !== filters.year) {
                        visible = false;
                    }
                    if (filters.type && type.indexOf(filters.type) === -1) {
                        visible = false;
                    }
                    if (filters.category && text.indexOf(filters.category) === -1) {
                        visible = false;
                    }
                    if (filters.genre && genre.indexOf(filters.genre) === -1) {
                        visible = false;
                    }
                    card.classList.toggle("is-hidden", !visible);
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
            if (reset) {
                reset.addEventListener("click", function () {
                    window.setTimeout(apply, 0);
                });
            }
            apply();
        });
    });
})();
