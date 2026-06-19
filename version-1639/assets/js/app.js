(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navMenu = document.querySelector('[data-nav-menu]');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startSlider() {
            stopSlider();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopSlider() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
                showSlide(index);
                startSlider();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startSlider();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startSlider();
            });
        }

        slider.addEventListener('mouseenter', stopSlider);
        slider.addEventListener('mouseleave', startSlider);
        startSlider();
    }

    var filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        var search = filterPanel.querySelector('[data-filter-search]');
        var region = filterPanel.querySelector('[data-filter-region]');
        var type = filterPanel.querySelector('[data-filter-type]');
        var year = filterPanel.querySelector('[data-filter-year]');
        var list = document.querySelector('[data-filter-list]');
        var empty = document.querySelector('[data-empty-result]');
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.filter-card')) : [];
        var params = new URLSearchParams(window.location.search);
        var preset = params.get('q');

        if (preset && search) {
            search.value = preset;
        }

        function matchYear(cardYear, selectedYear) {
            if (!selectedYear) {
                return true;
            }

            if (selectedYear.length === 4 && selectedYear.endsWith('0')) {
                var start = parseInt(selectedYear, 10);
                var value = parseInt(cardYear, 10);
                return value >= start && value < start + 10;
            }

            return cardYear === selectedYear;
        }

        function applyFilter() {
            var keyword = search ? search.value.trim().toLowerCase() : '';
            var selectedRegion = region ? region.value : '';
            var selectedType = type ? type.value : '';
            var selectedYear = year ? year.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-channel')
                ].join(' ').toLowerCase();

                var ok = true;
                ok = ok && (!keyword || haystack.indexOf(keyword) !== -1);
                ok = ok && (!selectedRegion || card.getAttribute('data-region') === selectedRegion);
                ok = ok && (!selectedType || card.getAttribute('data-type') === selectedType);
                ok = ok && matchYear(card.getAttribute('data-year') || '', selectedYear);

                card.hidden = !ok;

                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [search, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var trigger = player.querySelector('[data-play-trigger]');
        var hlsInstance = null;
        var attached = false;

        if (!video) {
            return;
        }

        function streamUrl() {
            var media = video.getAttribute('data-stream');
            var source = video.querySelector('source');
            return media || (source ? source.getAttribute('src') : '');
        }

        function attachStream() {
            var url = streamUrl();

            if (!url || attached) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);

                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
            } else {
                video.src = url;
            }

            attached = true;
        }

        function playVideo() {
            attachStream();

            if (trigger) {
                trigger.classList.add('is-hidden');
            }

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (trigger) {
                        trigger.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (trigger) {
            trigger.addEventListener('click', playVideo);
        }

        video.addEventListener('play', function () {
            if (trigger) {
                trigger.classList.add('is-hidden');
            }
        });

        video.addEventListener('click', attachStream);

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
