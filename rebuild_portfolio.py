# =============================================================================
# RETIRED — Google Drive API integration is now live (2026-07).
# This script is kept as a historical reference ONLY.
#
# To add new portfolio items: upload folders/files to the
# "portfolio" folder in Google Drive.
# The site updates automatically within 10 minutes (cache TTL).
# No redeploy and no script run needed.
# =============================================================================

import os
import re
import json

# Setup paths relative to the script location
base_dir = os.path.dirname(os.path.abspath(__file__))
portfolio_dir = os.path.join(base_dir, 'assets', 'portfolio')
index_path = os.path.join(base_dir, 'index.html')
data_js_path = os.path.join(base_dir, 'assets', 'js', 'portfolio-data.js')

if not os.path.isdir(portfolio_dir):
    print(f"Error: Could not find portfolio directory at {portfolio_dir}")
    exit(1)

# Scan and identify non-empty folders
all_folders = [f for f in os.listdir(portfolio_dir) if os.path.isdir(os.path.join(portfolio_dir, f))]
folders = []
for folder in all_folders:
    folder_path = os.path.join(portfolio_dir, folder)
    valid_files = [x for x in os.listdir(folder_path) if not x.startswith('.') and os.path.isfile(os.path.join(folder_path, x))]
    if valid_files:
        folders.append(folder)

has_random = 'Random' in folders
other_folders = sorted([f for f in folders if f != 'Random'], key=lambda s: s.lower())

# Build the filters HTML list
filter_items_html = []
if has_random:
    filter_items_html.append('              <li data-filter=".filter-random" class="filter-active">Random</li>')
else:
    filter_items_html.append('              <li data-filter="*" class="filter-active">All</li>')

for folder in other_folders:
    filter_class = "filter-" + folder.lower().replace(" ", "-").replace("(", "").replace(")", "")
    filter_items_html.append(f'              <li data-filter=".{filter_class}">{folder}</li>')

new_filters_content = '\n'.join(filter_items_html)

# Build the JSON items list
portfolio_items = []
ordered_folders = ['Random'] + other_folders if has_random else other_folders

for folder in ordered_folders:
    filter_class = "filter-" + folder.lower().replace(" ", "-").replace("(", "").replace(")", "")
    folder_path = os.path.join(portfolio_dir, folder)
    files = sorted([x for x in os.listdir(folder_path) if not x.startswith('.') and os.path.isfile(os.path.join(folder_path, x))])
    
    for file in files:
        rel_path = f'assets/portfolio/{folder}/{file}'
        is_video = file.lower().endswith(('.mp4', '.webm', '.ogg'))
        
        portfolio_items.append({
            "classes": filter_class,
            "type": "video" if is_video else "image",
            "src": rel_path,
            "title": folder,
            "link": rel_path,
            "gallery": f"portfolio-gallery-{filter_class.split('-')[-1]}"
        })

# Write data list to portfolio-data.js
js_content = f"// Automatically generated portfolio items data\nconst portfolioItems = {json.dumps(portfolio_items, indent=2)};\n"
with open(data_js_path, 'w', encoding='utf-8') as f:
    f.write(js_content)
print(f"Successfully wrote {len(portfolio_items)} items to {data_js_path}")

# Update index.html
if os.path.isfile(index_path):
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Replace the filters UL list content
    filters_start_tag = '<ul class="portfolio-filters isotope-filters mb-0" data-aos="fade-up" data-aos-delay="100">'
    filters_end_tag = '</ul><!-- End Portfolio Filters -->'
    
    start_idx = content.find(filters_start_tag)
    if start_idx != -1:
        end_idx = content.find(filters_end_tag, start_idx)
        if end_idx != -1:
            content = content[:start_idx + len(filters_start_tag)] + '\n' + new_filters_content + '\n            ' + content[end_idx:]
            print("Successfully updated filters list in index.html")
    
    # 2. Empty the HTML isotope-container to keep index.html clean and rely on dynamic JS loading
    container_start_tag = '<div class="row gy-4 isotope-container" data-aos="fade-up" data-aos-delay="200">'
    container_end_tag = '</div><!-- End Portfolio Container -->'
    
    c_start_idx = content.find(container_start_tag)
    if c_start_idx != -1:
        c_end_idx = content.find(container_end_tag, c_start_idx)
        if c_end_idx != -1:
            content = content[:c_start_idx + len(container_start_tag)] + '\n\n          ' + content[c_end_idx:]
            print("Successfully cleared inline isotope-container items in index.html")
            
    # 3. Update default filter settings
    if has_random:
        content = re.sub(r'data-default-filter="[^"]*"', 'data-default-filter=".filter-random"', content)
    else:
        content = re.sub(r'data-default-filter="[^"]*"', 'data-default-filter="*"', content)
        
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully updated index.html configurations.")
else:
    print(f"Warning: Could not find index.html at {index_path} to update.")
