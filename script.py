import os
import re
import json

# Setup paths relative to the script location
base_dir = os.path.dirname(os.path.abspath(__file__))
data_js_path = os.path.join(base_dir, 'assets', 'js', 'portfolio-data.js')

if not os.path.isfile(data_js_path):
    print(f"Error: Could not find {data_js_path}")
    exit(1)

with open(data_js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Extract the JSON array
m = re.search(r'const portfolioItems = (\[.*\]);', js_content, re.DOTALL)
if not m:
    print("Error: Could not find portfolioItems array in portfolio-data.js")
    exit(1)

try:
    items = json.loads(m.group(1))
except Exception as e:
    print(f"Error parsing JSON from portfolio-data.js: {e}")
    exit(1)

surgeries = []
crowns = []
prostho = []
scaling = []

for item in items:
    classes = item.get('classes', '')
    if 'surgeries' in classes or 'omfs' in classes:
        surgeries.append(item)
    elif 'crowns' in classes:
        crowns.append(item)
    elif 'prostho' in classes:
        prostho.append(item)
    elif 'scaling' in classes or 'perio' in classes:
        scaling.append(item)

# Select items based on specified rules
selected_items = []
selected_items.extend(surgeries)  # all surgeries

# 2 crowns
selected_items.extend(crowns[:2])

# 8th prostho (or first available if less than 8)
if len(prostho) >= 8:
    selected_items.append(prostho[7])
elif len(prostho) > 0:
    selected_items.append(prostho[0])

# 4th scaling (or first available if less than 4)
if len(scaling) >= 4:
    selected_items.append(scaling[3])
elif len(scaling) > 0:
    selected_items.append(scaling[0])

# Write the filtered list back to portfolio-data.js
new_js_content = f"// Automatically generated portfolio items data\nconst portfolioItems = {json.dumps(selected_items, indent=2)};\n"
with open(data_js_path, 'w', encoding='utf-8') as f:
    f.write(new_js_content)

print(f"Successfully filtered portfolio items down to {len(selected_items)} selected items.")
print(f"- Surgeries/OMFS: {len(surgeries)}")
print(f"- Crowns: {min(2, len(crowns))} (out of {len(crowns)})")
print(f"- Prostho: {1 if prostho else 0} (out of {len(prostho)})")
print(f"- Scaling/Perio: {1 if scaling else 0} (out of {len(scaling)})")
