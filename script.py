import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the container
start_marker = '<div class="row gy-4 isotope-container" data-aos="fade-up" data-aos-delay="200">'
end_marker = '</div><!-- End Portfolio Container -->'

start_idx = content.find(start_marker) + len(start_marker)
end_idx = content.find(end_marker, start_idx)

container_html = content[start_idx:end_idx]

# Split into items
item_pattern = r'(<div class="col-lg-4 col-md-6 portfolio-item .*?</div>\s*</div>\s*</div>)'
items = re.findall(item_pattern, container_html, re.DOTALL)

surgeries = []
crowns = []
prostho = []
scaling = []

for item in items:
    if 'filter-surgeries' in item:
        surgeries.append(item)
    elif 'filter-crowns' in item:
        crowns.append(item)
    elif 'filter-prostho' in item:
        prostho.append(item)
    elif 'filter-scaling' in item:
        scaling.append(item)

# Select exactly what the user asked
selected_items = []
selected_items.extend(surgeries) # all surgeries
if len(crowns) >= 2:
    selected_items.extend(crowns[0:2]) # first two crowns
if len(prostho) >= 8:
    selected_items.append(prostho[7]) # 8th prostho (index 7)
if len(scaling) >= 4:
    selected_items.append(scaling[3]) # 4th scaling (index 3)

new_container_html = "\n".join(selected_items) + "\n          "

new_content = content[:start_idx] + "\n\n" + new_container_html + content[end_idx:]

# Rename "All" to "Random"
new_content = new_content.replace('<li data-filter="*" class="filter-active">All</li>', '<li data-filter="*" class="filter-active">Random</li>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Total selected items: {len(selected_items)}")
