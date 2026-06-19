(function () {
  var input = document.querySelector('[data-search-input]');
  var title = document.querySelector('[data-search-title]');
  var results = document.querySelector('[data-search-results]');
  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var movies = window.SITE_MOVIES || [];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function render(items) {
    if (!results) {
      return;
    }

    results.innerHTML = items.map(function (movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '' +
        '<article class="movie-card">' +
          '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="poster-shade"></span>' +
            '<span class="play-dot">▶</span>' +
          '</a>' +
          '<div class="movie-info">' +
            '<div class="movie-meta-line">' +
              '<span>' + escapeHtml(movie.year) + '</span>' +
              '<span>' + escapeHtml(movie.type) + '</span>' +
              '<span>' + escapeHtml(movie.region) + '</span>' +
            '</div>' +
            '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="tag-row">' + tags + '</div>' +
          '</div>' +
        '</article>';
    }).join('');
  }

  function runSearch(keyword) {
    var value = keyword.trim().toLowerCase();
    var matched = value
      ? movies.filter(function (movie) {
          return movie.search.indexOf(value) !== -1;
        })
      : movies.slice(0, 60);

    render(matched.slice(0, 120));

    if (title) {
      title.textContent = value ? '与“' + keyword.trim() + '”相关的影片' : '精选影片';
    }
  }

  if (input) {
    input.value = query;
    input.addEventListener('input', function () {
      runSearch(input.value);
    });
  }

  runSearch(query);
})();
