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
   * Filter Tabs Pagination
   */
  const filterContainers = document.querySelectorAll('.portfolio-filters-container');
  filterContainers.forEach(container => {
    const filtersList = container.querySelector('.portfolio-filters');
    if (!filtersList) return;

    const items = Array.from(filtersList.querySelectorAll('li'));
    const prevBtn = container.querySelector('.filter-prev');
    const nextBtn = container.querySelector('.filter-next');

    const ITEMS_PER_PAGE = 8;

    if (items.length <= ITEMS_PER_PAGE || !prevBtn || !nextBtn) {
      return;
    }

    prevBtn.classList.remove('d-none');
    nextBtn.classList.remove('d-none');

    let currentPage = 0;
    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

    function updatePagination() {
      items.forEach((item, index) => {
        if (index >= currentPage * ITEMS_PER_PAGE && index < (currentPage + 1) * ITEMS_PER_PAGE) {
          item.style.display = 'inline-block';
        } else {
          item.style.display = 'none';
        }
      });

      prevBtn.disabled = currentPage === 0;
      nextBtn.disabled = currentPage === totalPages - 1;
    }

    prevBtn.addEventListener('click', () => {
      if (currentPage > 0) {
        currentPage--;
        updatePagination();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages - 1) {
        currentPage++;
        updatePagination();
      }
    });

    updatePagination();
  });

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
   * Hero video — mute / unmute toggle
   */
  const soundBtn = document.getElementById('video-sound-btn');
  const heroVideo = document.querySelector('.hero video');
  if (soundBtn && heroVideo) {
    soundBtn.addEventListener('click', function () {
      heroVideo.muted = !heroVideo.muted;
      const icon = soundBtn.querySelector('i');
      if (heroVideo.muted) {
        icon.className = 'bi bi-volume-mute-fill';
        soundBtn.title = 'Unmute video';
      } else {
        icon.className = 'bi bi-volume-up-fill';
        soundBtn.title = 'Mute video';
      }
    });
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
   * Load Hero and About videos dynamically from Google Drive (folder: 'videos')
   */
  async function loadDynamicVideos() {
    try {
      const API = window.DRIVE_API_BASE || '';
      let res = await fetch(`${API}/api/videos`);

      if (!res.ok) {
        console.warn('Could not fetch videos from /api/videos.');
        return;
      }
      
      const data = await res.json();
      const files = data.files || [];
      
      const heroFile = files.find(f => f.name.includes('herp-bg') || f.name.includes('hero'));
      if (heroFile) {
        const heroVideo = document.querySelector('.hero-video-wrapper video');
        if (heroVideo) {
          heroVideo.src = heroFile.src;
          heroVideo.load();
          
          const handleLoaded = () => {
            heroVideo.classList.add('is-loaded');
            const loader = document.getElementById('hero-video-loader');
            if (loader) loader.classList.add('hidden');
          };
          
          heroVideo.addEventListener('canplay', handleLoaded);
          if (heroVideo.readyState >= 3) {
            handleLoaded();
          }
          
          heroVideo.play().catch(e => console.log('Autoplay blocked:', e));
        }
      }
      
      const aboutFile = files.find(f => f.name.includes('about'));
      if (aboutFile) {
        const aboutVideo = document.getElementById('about-video');
        if (aboutVideo) {
          aboutVideo.src = aboutFile.src;
          aboutVideo.load();
        }
      }
    } catch (err) {
      console.error('Failed to load dynamic videos from Drive:', err);
    }
  }

  // Fetch videos after page load
  window.addEventListener('load', loadDynamicVideos);

})();