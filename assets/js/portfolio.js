(function () {
  "use strict";

  const container = document.querySelector('.portfolio .isotope-container');
  if (!container) return;

  if (typeof portfolioItems === 'undefined' || !Array.isArray(portfolioItems)) {
    console.error('portfolioItems is not defined or is not an array.');
    return;
  }

  let html = '';
  portfolioItems.forEach(item => {
    const isVideo = item.type === 'video';
    
    html += `
            <!-- ===== ${item.title.toUpperCase()} ===== -->
            <div class="col-lg-4 col-md-6 portfolio-item isotope-item ${item.classes}">
              <div class="portfolio-content h-100">
                ${isVideo ? `
                <video muted playsinline preload="metadata" class="portfolio-thumb-video">
                  <source src="${item.src}" type="video/mp4">
                </video>
                ` : `
                <img src="${item.src}" class="img-fluid" alt="${item.title}">
                `}
                <div class="portfolio-info">
                  <h4>${item.title}</h4>
                  <a href="${item.link}" ${isVideo ? 'data-type="video"' : ''} title="${item.title}" data-gallery="${item.gallery}" class="glightbox preview-link">
                    <i class="${isVideo ? 'bi bi-play-circle-fill' : 'bi bi-zoom-in'}"></i>
                  </a>
                </div>
              </div>
            </div>`;
  });

  container.innerHTML = html;
  console.log(`Successfully populated ${portfolioItems.length} portfolio items dynamically.`);
})();
