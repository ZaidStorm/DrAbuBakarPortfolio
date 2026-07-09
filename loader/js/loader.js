/**
 * Brand-reveal preloader controller.
 *
 * The CSS animations already choreograph the intro (ring -> dot -> mark ->
 * wordmark -> shine). This script's only job is deciding WHEN to remove the
 * preloader: not before the animation has had time to play, and not before
 * the real page is actually ready.
 */
(function () {
  var MIN_DISPLAY_TIME = window.innerWidth < 768 ? 800 : 2000; // keep in sync with --loader-duration
  var preloader = document.getElementById('preloader');

  if (!preloader) return;

  var start = Date.now();

  function reveal() {
    var elapsed = Date.now() - start;
    var remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);

    setTimeout(function () {
      preloader.classList.add('is-done');
      document.body.style.overflow = ''; // restore scrolling

      // fully remove from the DOM after the fade transition finishes
      preloader.addEventListener('transitionend', function handler(e) {
        if (e.propertyName === 'opacity' || e.propertyName === 'visibility') {
          preloader.remove();
          preloader.removeEventListener('transitionend', handler);
        }
      });
      // Fallback in case transitionend doesn't fire
      setTimeout(() => preloader.remove(), 1200);
    }, remaining);
  }

  // lock scrolling while the preloader is up
  document.body.style.overflow = 'hidden';

  // swap 'load' for your own readiness signal if you're waiting on
  // data fetches, fonts, etc. e.g. Promise.all([...]).then(reveal)
  if (document.readyState === 'complete') {
    reveal();
  } else {
    window.addEventListener('load', reveal);
  }
})();
