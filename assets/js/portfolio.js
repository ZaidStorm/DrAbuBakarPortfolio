/**
 * portfolio.js — Google Drive Edition
 *
 * Replaces the static portfolioItems / portfolio-data.js approach.
 * Fetches category list and file metadata from the /api/* serverless functions,
 * builds the same DOM structure that main.js Isotope + GLightbox expects,
 * then re-initialises both plugins after the async content lands.
 *
 * Configuration (set in index.html BEFORE this script):
 *   window.DRIVE_API_BASE (string, default "")  — empty = same Vercel origin
 */

(function () {
  'use strict';

  // ── Config ───────────────────────────────────────────────────────────────────
  const API = (typeof window.DRIVE_API_BASE === 'string'
    ? window.DRIVE_API_BASE
    : ''
  ).replace(/\/$/, '');   // strip trailing slash

  // ── DOM refs ─────────────────────────────────────────────────────────────────
  const layoutEl       = document.querySelector('.portfolio .isotope-layout');
  const container      = document.querySelector('.portfolio .isotope-container');
  // filtersWrapper now points to the nav-shell's scroll element that wraps the ul
  const filtersWrapper = document.getElementById('pfNavScroll');

  if (!container) return; // portfolio section not on this page

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  function showLoader() {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading portfolio…</span>
        </div>
        <p class="mt-3 text-muted small">Fetching cases from Google Drive…</p>
      </div>`;
  }

  function showError(msg) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-exclamation-triangle fs-1 text-warning d-block mb-2"></i>
        <p class="text-muted">${msg}</p>
        <button class="btn btn-sm btn-outline-secondary mt-2" onclick="location.reload()">
          Retry
        </button>
      </div>`;
  }

  // ── Filter list builder ───────────────────────────────────────────────────────
  // Mirrors the HTML that Sync-Portfolio.ps1 used to generate.
  function buildFilters(folders) {
    const ul = filtersWrapper && filtersWrapper.querySelector('.isotope-filters');
    if (!ul) return;

    const hasRandom = folders.some(f => f.name === 'Random');
    const defaultFilter = hasRandom ? '.filter-random' : '*';

    const liItems = folders.map((f, i) => {
      const activeClass = (i === 0) ? ' class="filter-active"' : '';
      return `<li data-filter=".${f.slug.startsWith('filter-') ? f.slug : 'filter-' + f.slug}"${activeClass}>${f.name}</li>`;
    }).join('\n            ');

    // Rebuild list items but keep the nav-indicator div at the end
    ul.innerHTML = liItems + '<div class="nav-indicator" id="pfIndicator"></div>';

    // Update data-default-filter so main.js Isotope re-layout picks it up
    if (layoutEl) layoutEl.setAttribute('data-default-filter', defaultFilter);

    return defaultFilter;
  }

  // ── Portfolio item HTML builder ───────────────────────────────────────────────
  function buildItemHTML(item) {
    const isVideo = item.type === 'video';
    return `
      <!-- ===== ${item.title.toUpperCase()} ===== -->
      <div class="col-lg-4 col-md-6 portfolio-item isotope-item filter-${item.slug}">
        <div class="portfolio-content h-100">
          ${isVideo
            ? `<video muted playsinline preload="metadata" class="portfolio-thumb-video">
                 <source src="${item.src}" type="video/mp4">
               </video>`
            : `<img src="${item.src}" class="img-fluid" alt="${item.title}" loading="lazy">`
          }
          <div class="portfolio-info">
            <h4>${item.title}</h4>
            <a href="${item.link}"
               ${isVideo ? 'data-type="video"' : ''}
               title="${item.title}"
               data-gallery="${item.gallery}"
               class="glightbox preview-link">
              <i class="${isVideo ? 'bi bi-play-circle-fill' : 'bi bi-zoom-in'}"></i>
            </a>
          </div>
        </div>
      </div>`;
  }

  // ── Isotope + GLightbox + filter-pagination re-init ───────────────────────────
  function reinitPlugins(defaultFilter) {
    if (typeof imagesLoaded !== 'function' || typeof Isotope !== 'function') return;

    imagesLoaded(container, function () {
      // Destroy any existing Isotope instance on this container
      const existing = Isotope.data(container);
      if (existing) existing.destroy();

      const iso = new Isotope(container, {
        itemSelector: '.isotope-item',
        layoutMode:   layoutEl ? (layoutEl.getAttribute('data-layout') || 'masonry') : 'masonry',
        sortBy:       'original-order',
        filter:       defaultFilter || '.filter-random',
      });

      // Re-bind filter buttons (uses new nav-shell selector)
      const filterBtns = document.querySelectorAll('#pfNavScroll .isotope-filters li');
      filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          const active = document.querySelector('.portfolio-filters .filter-active');
          if (active) active.classList.remove('filter-active');
          this.classList.add('filter-active');
          iso.arrange({ filter: this.getAttribute('data-filter') });
          if (typeof AOS !== 'undefined') AOS.refresh();
        });
      });

      // Re-init nav-shell indicator
      reinitNavShell();

      // Re-init GLightbox so new items get the lightbox treatment
      if (typeof GLightbox === 'function') {
        GLightbox({ selector: '.glightbox' });
      }

      // Refresh AOS
      if (typeof AOS !== 'undefined') AOS.refresh();
    });
  }

  // ── Nav-shell re-init after dynamic filter rebuild ────────────────────────────
  function reinitNavShell() {
    const indicator = document.getElementById('pfIndicator');
    if (!indicator || !filtersWrapper) return;

    const activeTab = filtersWrapper.querySelector('.isotope-filters li.filter-active')
                   || filtersWrapper.querySelector('.isotope-filters li');
    if (!activeTab) return;

    indicator.style.left  = activeTab.offsetLeft + 'px';
    indicator.style.width = activeTab.offsetWidth + 'px';
  }

  // ── Main async loader ─────────────────────────────────────────────────────────
  async function loadPortfolio() {
    showLoader();

    try {
      // 1. Get all category folders
      const foldersRes = await fetch(`${API}/api/portfolio`);
      if (!foldersRes.ok) throw new Error(`Category fetch failed (HTTP ${foldersRes.status})`);
      const folders = await foldersRes.json();   // [{ id, name, slug }]

      if (!folders.length) {
        showError('No portfolio categories found in Google Drive.');
        return;
      }

      // 2. Build filter buttons before files arrive (instant UI feedback)
      const defaultFilter = buildFilters(folders);

      // 3. Fetch all categories in parallel
      const categoryResults = await Promise.all(
        folders.map(f =>
          fetch(`${API}/api/portfolio/${encodeURIComponent(f.slug)}`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      );

      // 4. Flatten into a single ordered item list
      const allItems = [];
      folders.forEach((folder, idx) => {
        const data = categoryResults[idx];
        if (!data || !data.files || !data.files.length) return;

        data.files.forEach(file => {
          allItems.push({
            slug:   folder.slug,      // CSS class suffix
            type:   file.type,        // 'image' | 'video'
            src:    file.src,         // thumbnail URL
            link:   file.link,        // lightbox URL
            title:  folder.name,      // display label
            gallery: file.gallery,    // GLightbox gallery group
          });
        });
      });

      if (!allItems.length) {
        showError('Portfolio folders are empty. Add images/videos to Google Drive.');
        return;
      }

      // 5. Render grid
      container.innerHTML = allItems.map(buildItemHTML).join('');
      console.log(`[portfolio.js] ${allItems.length} items loaded from Google Drive.`);

      // 6. Re-initialise Isotope, GLightbox, pagination
      reinitPlugins(defaultFilter);

    } catch (err) {
      console.error('[portfolio.js] Load error:', err);
      showError('Could not load portfolio. Please try refreshing the page.');
    }
  }

  // Kick off
  loadPortfolio();

})();
