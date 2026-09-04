import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
        
    original = content
    
    # Replace text-{tone}-300 with text-{tone}-500 for better light mode contrast
    content = content.replace('text-indigo-300', 'text-indigo-500')
    content = content.replace('text-emerald-300', 'text-emerald-500')
    content = content.replace('text-amber-300', 'text-amber-500')
    content = content.replace('text-rose-300', 'text-rose-500')
    
    # Also fix hover states that use -200 (which is even lighter and invisible in light mode)
    content = content.replace('hover:text-indigo-200', 'hover:text-indigo-600')
    content = content.replace('hover:text-emerald-200', 'hover:text-emerald-600')
    content = content.replace('hover:text-amber-200', 'hover:text-amber-600')
    content = content.replace('hover:text-rose-200', 'hover:text-rose-600')

    # Fix indigo-400 as well since it was heavily used
    content = content.replace('text-indigo-400', 'text-indigo-500')
    
    if original != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            process_file(os.path.join(root, file))

print("Done")
