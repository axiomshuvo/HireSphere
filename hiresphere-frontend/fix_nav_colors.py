import os
import glob
import re

directories = ["src/components/dashboard", "src/components/shared"]

replacements = {
    "bg-(color-surface-2)": "bg-default-100",
    "bg-(color-surface)": "bg-content1",
    "text-(color-text-muted)": "text-default-500",
    "text-(color-text)": "text-foreground",
    "border-(color-border)": "border-default-200"
}

for d in directories:
    for filepath in glob.glob(d + "/**/*.jsx", recursive=True):
        with open(filepath, 'r') as f:
            content = f.read()
            
        original_content = content
        for old, new in replacements.items():
            content = content.replace(old, new)
            
        if content != original_content:
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"Fixed colors in {filepath}")
