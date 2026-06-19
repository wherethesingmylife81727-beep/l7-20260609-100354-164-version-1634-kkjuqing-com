(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('is-open');
        menuButton.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;
      function show(i) {
        if (!slides.length) return;
        index = (i + slides.length) % slides.length;
        slides.forEach(function (slide, n) {
          slide.classList.toggle('is-active', n === index);
        });
        dots.forEach(function (dot, n) {
          dot.classList.toggle('is-active', n === index);
        });
      }
      function start() {
        stop();
        timer = window.setInterval(function () { show(index + 1); }, 5600);
      }
      function stop() {
        if (timer) window.clearInterval(timer);
      }
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          start();
        });
      });
      if (prev) prev.addEventListener('click', function () { show(index - 1); start(); });
      if (next) next.addEventListener('click', function () { show(index + 1); start(); });
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]')).forEach(function (root) {
      var section = root.parentElement;
      var search = root.querySelector('[data-search-filter]');
      var type = root.querySelector('[data-type-filter]');
      var region = root.querySelector('[data-region-filter]');
      var category = root.querySelector('[data-category-filter]');
      var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
      function contains(value, expected) {
        if (!expected || expected === 'all') return true;
        return String(value || '').indexOf(expected) !== -1;
      }
      function apply() {
        var keyword = search ? search.value.trim().toLowerCase() : '';
        var typeValue = type ? type.value : 'all';
        var regionValue = region ? region.value : 'all';
        var categoryValue = category ? category.value : 'all';
        cards.forEach(function (card) {
          var haystack = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.genre, card.dataset.tags].join(' ').toLowerCase();
          var ok = (!keyword || haystack.indexOf(keyword) !== -1) && contains(card.dataset.type, typeValue) && contains(card.dataset.region, regionValue) && contains(card.dataset.category, categoryValue);
          card.classList.toggle('is-hidden', !ok);
        });
      }
      [search, type, region, category].forEach(function (control) {
        if (control) control.addEventListener('input', apply);
        if (control) control.addEventListener('change', apply);
      });
      apply();
    });
  });
})();
