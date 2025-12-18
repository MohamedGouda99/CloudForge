#!/usr/bin/env python3
"""
Fix missing commas in generated TypeScript service data files
"""
import re
import os

def fix_missing_commas(content):
    """Fix missing commas in TypeScript arrays"""
    lines = content.split('\n')
    fixed_lines = []
    
    for i, line in enumerate(lines):
        fixed_line = line
        
        # Check if this line starts with an object in an array (like { name: ...)
        # and the previous line ends with } but not },
        if i > 0 and re.match(r'^\s+\{', line):
            prev_line = lines[i-1].rstrip()
            # If previous line ends with } but not }, and this line starts with {
            if prev_line.endswith('}') and not prev_line.endswith('},') and not prev_line.endswith('};'):
                # Check if we're in an array context (previous line has [ or ends with ,)
                if '[' in lines[max(0, i-5):i] or prev_line.endswith(','):
                    # Add comma to previous line
                    if fixed_lines:
                        fixed_lines[-1] = prev_line + ','
        
        fixed_lines.append(fixed_line)
    
    return '\n'.join(fixed_lines)

def fix_file(filepath):
    """Fix a single file"""
    print(f"Fixing {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix missing commas after objects in arrays
    # Pattern: } followed by newline then { (in array context)
    patterns = [
        # Fix: } followed by { on next line (missing comma)
        (r'(\s+)\}\s*\n(\s+)\{', r'\1},\n\2{'),
        # Fix: } followed by } on next line (missing comma in nested)
        (r'(\s+)\}\s*\n(\s+)\}\s*\n(\s+)\}', r'\1},\n\2},\n\3}'),
    ]
    
    # More comprehensive fix: look for } not followed by , or } or ] or ;
    # but followed by { or another } on the next line
    lines = content.split('\n')
    fixed_lines = []
    in_array = False
    array_depth = 0
    
    for i, line in enumerate(lines):
        # Track array depth
        array_depth += line.count('[') - line.count(']')
        if '[' in line:
            in_array = True
        if ']' in line and array_depth == 0:
            in_array = False
        
        # Check if we need to add a comma
        if i > 0 and in_array:
            prev_line = lines[i-1].rstrip()
            current_line = line
            
            # If previous line ends with } and current starts with {
            if prev_line.endswith('}') and not prev_line.endswith('},') and not prev_line.endswith('};'):
                if re.match(r'^\s+\{', current_line):
                    # Add comma to previous line
                    if fixed_lines:
                        fixed_lines[-1] = prev_line + ','
        
        fixed_lines.append(line)
    
    content = '\n'.join(fixed_lines)
    
    # Additional fix: ensure all array items have commas
    # This is a more aggressive approach - fix all } followed by { or } in array context
    content = re.sub(r'(\s+)\}\s*\n(\s+)\{', r'\1},\n\2{', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"  Fixed {filepath}")

# Files to fix
files_to_fix = [
    'frontend/src/lib/gcp/securityServicesData.ts',
    'frontend/src/lib/gcp/messagingServicesData.ts',
    'frontend/src/lib/gcp/networkingServicesData.ts',
    'frontend/src/lib/gcp/managementServicesData.ts',
]

base_dir = r'C:\Users\goda\Desktop\CloudForge'

for file in files_to_fix:
    filepath = os.path.join(base_dir, file)
    if os.path.exists(filepath):
        fix_file(filepath)
    else:
        print(f"File not found: {filepath}")

print("Done fixing files!")

