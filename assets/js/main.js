/**
* Template Name: iPortfolio
* Template URL: https://bootstrapmade.com/iportfolio-bootstrap-portfolio-websites-template/
* Updated: Jun 29 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function () {
  "use strict";

  /**
   * Header toggle
   */
  const headerToggleBtn = document.querySelector('.header-toggle');

  function headerToggle() {
    document.querySelector('#header').classList.toggle('header-show');
    headerToggleBtn.classList.toggle('bi-list');
    headerToggleBtn.classList.toggle('bi-x');
  }
  headerToggleBtn.addEventListener('click', headerToggle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.header-show')) {
        headerToggle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function (e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });


  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false,
      disable: window.innerWidth < 768
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Init typed.js
   */
  const selectTyped = document.querySelector('.typed');
  if (selectTyped) {
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function (direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function (isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function () {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function (filters) {
      filters.addEventListener('click', function () {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Portfolio Nav Shell — scrollable tab strip with indicator & arrows
   */
  (function () {
    const scrollEl   = document.getElementById('pfNavScroll');
    const filtersList = scrollEl && scrollEl.querySelector('.portfolio-filters');
    if (!scrollEl || !filtersList) return;

    const tabs       = Array.from(filtersList.querySelectorAll('li'));
    const indicator  = document.getElementById('pfIndicator');
    const arrowLeft  = document.getElementById('pfArrowLeft');
    const arrowRight = document.getElementById('pfArrowRight');
    const fadeLeft   = document.getElementById('pfFadeLeft');
    const fadeRight  = document.getElementById('pfFadeRight');

    /* ── Indicator position ─────────────────────────────────── */
    function moveIndicator(tab) {
      if (!indicator) return;
      // tab.offsetLeft is relative to filtersList; scrollEl scrollLeft shifts it
      indicator.style.left  = tab.offsetLeft + 'px';
      indicator.style.width = tab.offsetWidth + 'px';
    }

    /* ── Arrow & fade state ─────────────────────────────────── */
    function updateArrows() {
      const max = scrollEl.scrollWidth - scrollEl.clientWidth - 1;
      arrowLeft.disabled  = scrollEl.scrollLeft <= 0;
      arrowRight.disabled = scrollEl.scrollLeft >= max;
      if (fadeLeft)  fadeLeft.style.opacity  = arrowLeft.disabled  ? '0' : '1';
      if (fadeRight) fadeRight.style.opacity = arrowRight.disabled ? '0' : '1';
    }

    /* ── Tab click — handled here for indicator; Isotope click
         is already bound in the block above via .isotope-filters li ── */
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        moveIndicator(this);
        this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
    });

    /* ── Arrow clicks ────────────────────────────────────────── */
    arrowLeft.addEventListener('click',  function () { scrollEl.scrollBy({ left: -220, behavior: 'smooth' }); });
    arrowRight.addEventListener('click', function () { scrollEl.scrollBy({ left:  220, behavior: 'smooth' }); });

    scrollEl.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', function () {
      const active = tabs.find(function (t) { return t.classList.contains('filter-active'); });
      if (active) moveIndicator(active);
      updateArrows();
    });

    /* ── Init ────────────────────────────────────────────────── */
    const firstActive = tabs.find(function (t) { return t.classList.contains('filter-active'); }) || tabs[0];
    if (firstActive) moveIndicator(firstActive);
    updateArrows();
  })();

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", function () {
    initSwiper();
    // Force Isotope layout recalculation after Swiper initializes
    setTimeout(function () {
      document.querySelectorAll('.isotope-layout').forEach(function (isotopeItem) {
        let container = isotopeItem.querySelector('.isotope-container');
        if (container && window.Isotope && Isotope.data(container)) {
          Isotope.data(container).layout();
        }
      });
      // Refresh AOS after layouts are complete
      if (typeof aosInit === 'function') {
        aosInit();
      }
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }
    }, 500);
  });

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function (e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

  /**
   * About section video — auto play / pause on scroll
   */
  const aboutVideo = document.getElementById('about-video');
  if (aboutVideo) {
    const videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          aboutVideo.play();
        } else {
          aboutVideo.pause();
        }
      });
    }, { threshold: 0.4 }); // triggers when 40% of the video is visible
    videoObserver.observe(aboutVideo);
  }



  /**
   * Contact Form — EmailJS
   * TODO: Replace SERVICE_ID and TEMPLATE_ID with values from your EmailJS dashboard.
   */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const loading = document.getElementById('form-loading');
      const errorMsg = document.getElementById('form-error');
      const successMsg = document.getElementById('form-success');
      const submitBtn = document.getElementById('submit-btn');

      // Auto-fill the time field with current date & time
      const timeField = document.getElementById('time-field');
      if (timeField) {
        timeField.value = new Date().toLocaleString('en-PK', { dateStyle: 'full', timeStyle: 'short' });
      }

      // Reset state
      loading.style.display = 'block';
      errorMsg.style.display = 'none';
      successMsg.style.display = 'none';
      submitBtn.disabled = true;

      // TODO: Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID'
      emailjs.sendForm('service_sihdjd2', 'template_nrzrthl', this)
        .then(function () {
          loading.style.display = 'none';
          successMsg.style.display = 'block';
          contactForm.reset();
          submitBtn.disabled = false;
        }, function (error) {
          loading.style.display = 'none';
          errorMsg.textContent = 'Failed to send message. Please try again. (' + JSON.stringify(error) + ')';
          errorMsg.style.display = 'block';
          submitBtn.disabled = false;
        });
    });
  }

  /**
   * Sidebar Scroll Progress Theme
   */
  const rootElement = document.documentElement;
  let scrollTicking = false;

  // Read colors from CSS
  function getScrollColors() {
    const style = getComputedStyle(rootElement);
    const colors = [];
    for (let i = 1; i <= 6; i++) {
      const colorVal = style.getPropertyValue(`--scroll-color-${i}`).trim();
      if (colorVal) {
        const rgb = colorVal.split(',').map(Number);
        if (rgb.length === 3 && !isNaN(rgb[0])) {
          colors.push(rgb);
        }
      }
    }
    // Fallback colors just in case CSS hasn't loaded or missing variables
    return colors.length > 0 ? colors : [
      [127, 168, 150], [201, 138, 91], [122, 147, 201], 
      [199, 162, 74], [164, 121, 201], [220, 80, 110]
    ];
  }

  let colorStops = [];
  
  // init color stops when page loads fully so CSS variables are accessible
  window.addEventListener('load', () => {
    const scrollColors = getScrollColors();
    colorStops = scrollColors.map((color, index) => {
      return {
        at: index / (scrollColors.length - 1 || 1),
        color: color
      };
    });
    updateSidebarColor();
  });

  // linear interpolation between two [r,g,b] arrays
  function lerpColor(c1, c2, t){
    return c1.map((v, i) => Math.round(v + (c2[i] - v) * t));
  }

  function colorAtProgress(p){
    if (colorStops.length === 0) return [127, 168, 150]; // fallback before load
    for (let i = 0; i < colorStops.length - 1; i++){
      const a = colorStops[i], b = colorStops[i + 1];
      if (p >= a.at && p <= b.at){
        const t = (p - a.at) / (b.at - a.at);
        return lerpColor(a.color, b.color, t);
      }
    }
    return colorStops[colorStops.length - 1].color;
  }

  function updateSidebarColor(){
    const scrollTop = window.scrollY;
    // We calculate scrollable height based on the body scrollHeight minus viewport height
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;

    const rgb = colorAtProgress(progress);
    if(rgb && rgb.length === 3) {
      rootElement.style.setProperty('--accent', `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
      rootElement.style.setProperty('--accent-dim', `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.14)`);
    }
    scrollTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking){
      requestAnimationFrame(updateSidebarColor);
      scrollTicking = true;
    }
  });

  // ============================================================
  // SIDEBAR BACKGROUND — bokeh particle generator
  // ============================================================
  function initNavBokeh(navSelector = '.sidebar', particleCount = 14) {
    const nav = document.querySelector(navSelector);
    if (!nav) return;

    const layer = document.createElement('div');
    layer.className = 'bokeh-layer';
    nav.appendChild(layer);

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const size = 4 + Math.random() * 8; // 4px - 12px

      particle.className = 'particle';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 10}s`;
      particle.style.animationDuration = `${8 + Math.random() * 8}s`; // 8s - 16s

      layer.appendChild(particle);
    }
  }

  window.addEventListener('load', () => {
    initNavBokeh('.sidebar', 14);
  });

})();