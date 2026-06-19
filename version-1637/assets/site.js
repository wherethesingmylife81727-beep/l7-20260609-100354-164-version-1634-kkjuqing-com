(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startAutoPlay() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startAutoPlay();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(index - 1);
        startAutoPlay();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startAutoPlay();
      });
    }

    showSlide(0);
    startAutoPlay();
  }

  var filterInput = document.querySelector('[data-local-filter]');
  var filterList = document.querySelector('[data-filter-list]');

  if (filterInput && filterList) {
    var items = Array.prototype.slice.call(filterList.querySelectorAll('[data-search-item]'));

    filterInput.addEventListener('input', function () {
      var keyword = filterInput.value.trim().toLowerCase();

      items.forEach(function (item) {
        var text = item.getAttribute('data-search') || '';
        item.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
      });
    });
  }
})();
