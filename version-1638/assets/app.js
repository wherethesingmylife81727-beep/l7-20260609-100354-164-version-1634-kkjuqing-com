(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                play();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                play();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", play);
        play();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (filterPanel) {
        var section = filterPanel.closest(".section-block") || document;
        var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
        var empty = section.querySelector("[data-empty-state]");
        var search = filterPanel.querySelector("[data-local-search]");
        var reset = filterPanel.querySelector("[data-filter-reset]");
        var regionButtons = Array.prototype.slice.call(filterPanel.querySelectorAll("[data-filter-region]"));
        var typeButtons = Array.prototype.slice.call(filterPanel.querySelectorAll("[data-filter-type]"));
        var activeRegion = "";
        var activeType = "";

        function setButtonState(buttons, activeValue, attribute) {
            buttons.forEach(function (button) {
                button.classList.toggle("is-active", button.getAttribute(attribute) === activeValue && activeValue !== "");
            });
        }

        function applyFilter() {
            var query = search ? search.value.trim().toLowerCase() : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-title") || "").toLowerCase();
                var region = card.getAttribute("data-region") || "";
                var type = card.getAttribute("data-type") || "";
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesRegion = !activeRegion || region.indexOf(activeRegion) !== -1;
                var matchesType = !activeType || type.indexOf(activeType) !== -1;
                var show = matchesQuery && matchesRegion && matchesType;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (search) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q) {
                search.value = q;
            }
            search.addEventListener("input", applyFilter);
        }

        regionButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeRegion = button.getAttribute("data-filter-region") || "";
                activeType = "";
                setButtonState(regionButtons, activeRegion, "data-filter-region");
                setButtonState(typeButtons, activeType, "data-filter-type");
                if (reset) {
                    reset.classList.remove("is-active");
                }
                applyFilter();
            });
        });

        typeButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeType = button.getAttribute("data-filter-type") || "";
                activeRegion = "";
                setButtonState(typeButtons, activeType, "data-filter-type");
                setButtonState(regionButtons, activeRegion, "data-filter-region");
                if (reset) {
                    reset.classList.remove("is-active");
                }
                applyFilter();
            });
        });

        if (reset) {
            reset.addEventListener("click", function () {
                activeRegion = "";
                activeType = "";
                if (search) {
                    search.value = "";
                }
                regionButtons.forEach(function (button) {
                    button.classList.remove("is-active");
                });
                typeButtons.forEach(function (button) {
                    button.classList.remove("is-active");
                });
                reset.classList.add("is-active");
                applyFilter();
            });
        }

        applyFilter();
    });
})();
