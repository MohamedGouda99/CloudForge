#!/usr/bin/env python3
"""
Comprehensive fix for all TypeScript service data files
Fixes missing commas, formatting, and function names
"""
import re
import os

def fix_ts_file(filepath):
    """Fix a TypeScript service data file"""
    print(f"Fixing {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    fixed_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Fix missing commas: if line ends with } and next line starts with {
        if i < len(lines) - 1:
            next_line = lines[i + 1]
            stripped_line = line.rstrip()
            stripped_next = next_line.strip()
            
            # If current line ends with } and next starts with {, add comma
            if (stripped_line.endswith('}') and 
                not stripped_line.endswith('},') and 
                not stripped_line.endswith('};') and
                not stripped_line.endswith('});') and
                stripped_next.startswith('{')):
                # Check if we're in an array context (look back for [)
                context_lines = lines[max(0, i-10):i+1]
                has_array = any('[' in l for l in context_lines)
                if has_array:
                    line = stripped_line + ','
        
        fixed_lines.append(line)
        i += 1
    
    content = '\n'.join(fixed_lines)
    
    # Fix function names (security file has wrong names)
    if 'securityServicesData.ts' in filepath:
        content = content.replace('getSecurityIdentityServiceByTerraformResource', 'getSecurityServiceByTerraformResource')
        content = content.replace('getSecurityIdentityServiceById', 'getSecurityServiceById')
        content = content.replace('isSecurityIdentityResource', 'isSecurityResource')
        content = content.replace('getSecurityIdentityIcon', 'getSecurityIcon')
        content = content.replace('SecurityIdentityServiceDefinition', 'SecurityServiceDefinition')
    
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
        fix_ts_file(filepath)
    else:
        print(f"File not found: {filepath}")

print("Done fixing all files!")

