import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
        
    changed = False
    new_lines = []
    
    for line in lines:
        if 'text-white' in line:
            # Skip lines where text-white is used with dark backgrounds or overlays
            if re.search(r'bg-black|bg-indigo|bg-emerald|bg-rose|bg-danger|bg-primary|bg-[#1b1c1e]', line):
                new_lines.append(line)
                continue
                
            # Otherwise replace text-white with text-foreground
            new_line = line.replace('text-white', 'text-foreground')
            
            # Also replace common dark-mode-only backgrounds and borders that might be nearby
            new_line = new_line.replace('bg-[#1b1c1e]', 'bg-default-100')
            new_line = new_line.replace('border-white/10', 'border-default-200')
            new_line = new_line.replace('border-white/15', 'border-default-200')
            
            new_lines.append(new_line)
            changed = True
        else:
            new_lines.append(line)
            
    if changed:
        with open(filepath, 'w') as f:
            f.writelines(new_lines)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            process_file(os.path.join(root, file))

print("Done")
