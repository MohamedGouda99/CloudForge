#!/usr/bin/env python3
"""
Script to update AWS resource icons in awsResources.ts
Replaces emoji icons with getAWSIcon() calls
"""

import re

# Read the file
file_path = 'frontend/src/lib/resources/awsResources.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to match: icon: 'emoji' or icon: "emoji"
# We want to replace it with: icon: getAWSIcon('resource_type')

def replace_icon(match):
    """Replace icon emoji with getAWSIcon call based on the resource type"""
    # Get the full resource object
    full_match = match.group(0)

    # Extract the resource type from the object
    type_match = re.search(r"type:\s*['\"]([^'\"]+)['\"]", full_match)
    if type_match:
        resource_type = type_match.group(1)
        # Replace the icon line
        new_match = re.sub(
            r"icon:\s*['\"][^'\"]*['\"]",
            f"icon: getAWSIcon('{resource_type}')",
            full_match
        )
        return new_match
    return full_match

# Pattern to match entire resource object (from { to })
# Match resource objects that have type, label, icon fields
pattern = r'\{\s*type:\s*[\'"][^\'"]+[\'"]\s*,\s*label:\s*[\'"][^\'"]+[\'"]\s*,\s*icon:\s*[\'"][^\'"]+[\'"]\s*,\s*category:[^}]+\}'

# This is complex, let's use a simpler approach:
# Find all lines with icon: 'emoji' and the corresponding type above it

lines = content.split('\n')
new_lines = []
current_type = None

for i, line in enumerate(lines):
    # Check if this line contains a type definition
    type_match = re.search(r"type:\s*['\"]([^'\"]+)['\"]", line)
    if type_match:
        current_type = type_match.group(1)

    # Check if this line contains an icon definition
    icon_match = re.search(r"icon:\s*['\"]([^'\"]+)['\"]", line)
    if icon_match and current_type:
        # Replace emoji icon with getAWSIcon call
        new_line = re.sub(
            r"icon:\s*['\"][^'\"]*['\"]",
            f"icon: getAWSIcon('{current_type}')",
            line
        )
        new_lines.append(new_line)
        current_type = None  # Reset after using
    else:
        new_lines.append(line)

# Join lines back
new_content = '\n'.join(new_lines)

# Write back to file
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"✅ Updated {file_path}")
print("All AWS resource icons have been replaced with getAWSIcon() calls")
