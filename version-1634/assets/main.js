(function () {
    var navLinks = document.getElementById('navLinks');
    var menuToggle = document.querySelector('.menu-toggle');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function () {
            var opened = navLinks.classList.toggle('is-open');
            menuToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var prev = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        var current = 0;
        var timer = null;

        if (!slides.length) {
            return;
        }

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        start();
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function cardText(card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
        ].join(' '));
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .wide-card'));
        var inputs = Array.prototype.slice.call(document.querySelectorAll('.inline-search input'));
        var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
        var empty = document.querySelector('.empty-state');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('search') || '';
        var activeFilter = 'all';

        if (!cards.length) {
            return;
        }

        function apply() {
            var query = normalize(inputs.length ? inputs[0].value : initial);
            var filter = normalize(activeFilter === 'all' ? '' : activeFilter);
            var visible = 0;

            cards.forEach(function (card) {
                var text = cardText(card);
                var matchedQuery = !query || text.indexOf(query) !== -1;
                var matchedFilter = !filter || text.indexOf(filter) !== -1;
                var ok = matchedQuery && matchedFilter;
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        inputs.forEach(function (input) {
            if (initial && !input.value) {
                input.value = initial;
            }
            input.addEventListener('input', apply);
            if (input.form) {
                input.form.addEventListener('submit', function (event) {
                    event.preventDefault();
                    apply();
                });
            }
        });

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('active');
                });
                chip.classList.add('active');
                activeFilter = chip.getAttribute('data-filter') || 'all';
                apply();
            });
        });

        apply();
    }

    function setupTopSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('.nav-search, .big-search'));
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="search"]');
                if (!input) {
                    return;
                }
                var query = input.value.trim();
                if (!query) {
                    return;
                }
                event.preventDefault();
                window.location.href = './category-all.html?search=' + encodeURIComponent(query);
            });
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.player-box'));

        players.forEach(function (box) {
            var video = box.querySelector('video');
            var cover = box.querySelector('.player-cover');
            var message = box.querySelector('.player-message');
            var hls = null;
            var loaded = false;

            if (!video) {
                return;
            }

            function setMessage(text) {
                if (message) {
                    message.textContent = text || '';
                }
            }

            function loadStream() {
                if (loaded) {
                    return;
                }

                var stream = video.getAttribute('data-stream');
                if (!stream) {
                    setMessage('播放暂时不可用');
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('播放暂时不可用');
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else {
                    video.src = stream;
                }

                loaded = true;
            }

            function play() {
                loadStream();
                box.classList.add('is-playing');
                if (cover) {
                    cover.classList.add('is-hidden');
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        box.classList.remove('is-playing');
                        if (cover) {
                            cover.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (cover) {
                cover.addEventListener('click', play);
            }

            video.addEventListener('play', function () {
                box.classList.add('is-playing');
                if (cover) {
                    cover.classList.add('is-hidden');
                }
            });

            video.addEventListener('pause', function () {
                if (!video.ended) {
                    box.classList.remove('is-playing');
                }
            });

            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupHero();
        setupTopSearch();
        setupFilters();
        setupPlayers();
    });
})();
