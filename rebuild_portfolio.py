import os
import re

portfolio_dir = r'd:\SE\Portfolios\Dr. AbuBakar\iPortfolio-1.0.0\assets\portfolio'
folders = [f for f in os.listdir(portfolio_dir) if os.path.isdir(os.path.join(portfolio_dir, f))]

html_output = []

filter_mapping = {
    'Surgeries': 'filter-surgeries',
    'Crowns': 'filter-crowns',
    'Dental Filling': 'filter-dental-filling',
    'Implants': 'filter-implants',
    'Prostho Cases': 'filter-prostho',
    'Scaling and Polishing': 'filter-scaling',
    'Stamp Technique(Fillling)': 'filter-stamp',
    'Tooth Extractions': 'filter-extractions'
}

# The specific 5 items to be shown in the "Random" tab
random_items = [
    r'assets/portfolio/Surgeries/WhatsApp Image 2026-07-06 at 12.53.31 PM (1).jpeg',
    r'assets/portfolio/Crowns/WhatsApp Image 2026-07-06 at 12.49.24 PM.jpeg',
    r'assets/portfolio/Crowns/WhatsApp Image 2026-07-06 at 12.49.25 PM.jpeg',
    r'assets/portfolio/Prostho Cases/WhatsApp Video 2026-07-06 at 12.58.08 PM (2).mp4',
    r'assets/portfolio/Scaling and Polishing/WhatsApp Video 2026-07-06 at 12.55.27 PM.mp4'
]

for folder in sorted(folders):
    filter_class = filter_mapping.get(folder, 'filter-' + folder.lower().replace(' ', '-'))
    display_name = folder
    if folder == 'Stamp Technique(Fillling)':
        display_name = 'Stamp Technique'
    
    files = os.listdir(os.path.join(portfolio_dir, folder))
    for file in sorted(files):
        if file.startswith('.'):
            continue
        rel_path = f'assets/portfolio/{folder}/{file}'
        
        extra_class = ' filter-random' if rel_path in random_items else ''
        
        html_output.append(f'            <!-- ===== {display_name.upper()} ===== -->')
        html_output.append(f'            <div class="col-lg-4 col-md-6 portfolio-item isotope-item {filter_class}{extra_class}">')
        html_output.append(f'              <div class="portfolio-content h-100">')
        
        is_video = file.lower().endswith(('.mp4', '.webm', '.ogg'))
        
        if is_video:
            html_output.append(f'                <video muted playsinline preload="metadata" class="portfolio-thumb-video">')
            html_output.append(f'                  <source src="{rel_path}" type="video/mp4">')
            html_output.append(f'                </video>')
            html_output.append(f'                <div class="portfolio-info">')
            html_output.append(f'                  <h4>{display_name}</h4>')
            html_output.append(f'                  <a href="{rel_path}" data-type="video" title="{display_name}" data-gallery="portfolio-gallery-{filter_class.split("-")[-1]}" class="glightbox preview-link"><i class="bi bi-play-circle-fill"></i></a>')
            html_output.append(f'                </div>')
        else:
            html_output.append(f'                <img src="{rel_path}" class="img-fluid" alt="{display_name}">')
            html_output.append(f'                <div class="portfolio-info">')
            html_output.append(f'                  <h4>{display_name}</h4>')
            html_output.append(f'                  <a href="{rel_path}" title="{display_name}" data-gallery="portfolio-gallery-{filter_class.split("-")[-1]}" class="glightbox preview-link"><i class="bi bi-zoom-in"></i></a>')
            html_output.append(f'                </div>')
            
        html_output.append(f'              </div>')
        html_output.append(f'            </div>')
        html_output.append(f'')

items_html = '\n'.join(html_output)

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the filters UL list
filters_start = content.find('<ul class="portfolio-filters')
filters_end = content.find('</ul><!-- End Portfolio Filters -->') + len('</ul><!-- End Portfolio Filters -->')

new_filters = '''<ul class="portfolio-filters isotope-filters" data-aos="fade-up" data-aos-delay="100">
            <li data-filter=".filter-random" class="filter-active">Random</li>
            <li data-filter=".filter-surgeries">Surgeries</li>
            <li data-filter=".filter-crowns">Crowns</li>
            <li data-filter=".filter-dental-filling">Dental Filling</li>
            <li data-filter=".filter-implants">Implants</li>
            <li data-filter=".filter-prostho">Prostho Cases</li>
            <li data-filter=".filter-scaling">Scaling &amp; Polishing</li>
            <li data-filter=".filter-stamp">Stamp Technique</li>
            <li data-filter=".filter-extractions">Tooth Extractions</li>
          </ul><!-- End Portfolio Filters -->'''

content = content[:filters_start] + new_filters + content[filters_end:]

# Replace the container
container_start = content.find('<div class="row gy-4 isotope-container"')
container_end = content.find('</div><!-- End Portfolio Container -->')
# Find the exact start of the content inside the container
content_start = content.find('>', container_start) + 1

content = content[:content_start] + '\n\n' + items_html + content[container_end:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done generating portfolio items.")
