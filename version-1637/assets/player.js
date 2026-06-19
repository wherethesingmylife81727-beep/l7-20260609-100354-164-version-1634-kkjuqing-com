(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var source = player.getAttribute('data-video');
    var attached = false;
    var hlsInstance = null;

    function attachSource() {
      if (attached || !video || !source) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
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

    function startPlay() {
      attachSource();

      if (cover) {
        cover.classList.add('hidden');
      }

      video.controls = true;
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (cover) {
            cover.classList.remove('hidden');
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', startPlay);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlay();
        } else {
          video.pause();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
