#!/usr/bin/env python3
"""
Generate all GCP service TypeScript files from JSON definitions
This script creates servicesData.ts and catalog.ts files for each category
"""
import json
import os
from pathlib import Path

# Icon mappings for each service category
ICONS = {
    'messaging': {
        'google_pubsub_topic': '/api/icons/gcp/google-cloud-legacy-icons/pubsub/pubsub.svg',
        'google_pubsub_subscription': '/api/icons/gcp/google-cloud-legacy-icons/pubsub/pubsub.svg',
        'google_pubsub_schema': '/api/icons/gcp/google-cloud-legacy-icons/pubsub/pubsub.svg',
        'google_cloud_tasks_queue': '/api/icons/gcp/google-cloud-legacy-icons/cloud_tasks/cloud_tasks.svg',
        'google_cloud_scheduler_job': '/api/icons/gcp/google-cloud-legacy-icons/cloud_scheduler/cloud_scheduler.svg',
        'google_workflows_workflow': '/api/icons/gcp/google-cloud-legacy-icons/workflows/workflows.svg',
        'google_eventarc_trigger': '/api/icons/gcp/google-cloud-legacy-icons/eventarc/eventarc.svg',
        'google_apigee_organization': '/api/icons/gcp/core-products-icons/Unique Icons/Apigee/SVG/Apigee-512-color-rgb.svg',
    },
    'networking': {
        'google_compute_network': '/api/icons/gcp/google-cloud-legacy-icons/virtual_private_cloud/virtual_private_cloud.svg',
        'google_compute_subnetwork': '/api/icons/gcp/google-cloud-legacy-icons/virtual_private_cloud/virtual_private_cloud.svg',
        'google_compute_firewall': '/api/icons/gcp/google-cloud-legacy-icons/cloud_firewall_rules/cloud_firewall_rules.svg',
        'google_compute_router': '/api/icons/gcp/google-cloud-legacy-icons/cloud_router/cloud_router.svg',
        'google_compute_router_nat': '/api/icons/gcp/google-cloud-legacy-icons/cloud_nat/cloud_nat.svg',
        'google_compute_forwarding_rule': '/api/icons/gcp/google-cloud-legacy-icons/cloud_load_balancing/cloud_load_balancing.svg',
        'google_compute_global_forwarding_rule': '/api/icons/gcp/google-cloud-legacy-icons/cloud_load_balancing/cloud_load_balancing.svg',
        'google_compute_backend_service': '/api/icons/gcp/google-cloud-legacy-icons/cloud_load_balancing/cloud_load_balancing.svg',
        'google_compute_health_check': '/api/icons/gcp/google-cloud-legacy-icons/cloud_load_balancing/cloud_load_balancing.svg',
        'google_dns_managed_zone': '/api/icons/gcp/google-cloud-legacy-icons/cloud_dns/cloud_dns.svg',
        'google_dns_record_set': '/api/icons/gcp/google-cloud-legacy-icons/cloud_dns/cloud_dns.svg',
        'google_compute_vpn_gateway': '/api/icons/gcp/google-cloud-legacy-icons/cloud_vpn/cloud_vpn.svg',
        'google_compute_ha_vpn_gateway': '/api/icons/gcp/google-cloud-legacy-icons/cloud_vpn/cloud_vpn.svg',
        'google_service_networking_connection': '/api/icons/gcp/google-cloud-legacy-icons/private_service_connect/private_service_connect.svg',
    },
    'security': {
        'google_service_account': '/api/icons/gcp/google-cloud-legacy-icons/identity_and_access_management/identity_and_access_management.svg',
        'google_service_account_key': '/api/icons/gcp/google-cloud-legacy-icons/key_management_service/key_management_service.svg',
        'google_project_iam_binding': '/api/icons/gcp/google-cloud-legacy-icons/identity_and_access_management/identity_and_access_management.svg',
        'google_project_iam_member': '/api/icons/gcp/google-cloud-legacy-icons/identity_and_access_management/identity_and_access_management.svg',
        'google_kms_key_ring': '/api/icons/gcp/google-cloud-legacy-icons/key_management_service/key_management_service.svg',
        'google_kms_crypto_key': '/api/icons/gcp/google-cloud-legacy-icons/key_management_service/key_management_service.svg',
        'google_secret_manager_secret': '/api/icons/gcp/google-cloud-legacy-icons/secret_manager/secret_manager.svg',
        'google_secret_manager_secret_version': '/api/icons/gcp/google-cloud-legacy-icons/secret_manager/secret_manager.svg',
        'google_iap_web_iam_binding': '/api/icons/gcp/google-cloud-legacy-icons/identity-aware_proxy/identity-aware_proxy.svg',
        'google_organization_policy': '/api/icons/gcp/google-cloud-legacy-icons/security/security.svg',
        'google_compute_security_policy': '/api/icons/gcp/google-cloud-legacy-icons/cloud_armor/cloud_armor.svg',
    },
    'serverless': {
        'google_cloudfunctions_function': '/api/icons/gcp/google-cloud-legacy-icons/cloud_functions/cloud_functions.svg',
        'google_cloudfunctions2_function': '/api/icons/gcp/google-cloud-legacy-icons/cloud_functions/cloud_functions.svg',
        'google_cloud_run_service': '/api/icons/gcp/core-products-icons/Unique Icons/Cloud Run/SVG/CloudRun-512-color-rgb.svg',
        'google_app_engine_application': '/api/icons/gcp/google-cloud-legacy-icons/app_engine/app_engine.svg',
    },
    'storage': {
        'google_storage_bucket': '/api/icons/gcp/core-products-icons/Unique Icons/Cloud Storage/SVG/Cloud_Storage-512-color.svg',
        'google_storage_bucket_object': '/api/icons/gcp/core-products-icons/Unique Icons/Cloud Storage/SVG/Cloud_Storage-512-color.svg',
        'google_storage_bucket_iam_binding': '/api/icons/gcp/core-products-icons/Unique Icons/Cloud Storage/SVG/Cloud_Storage-512-color.svg',
        'google_storage_bucket_acl': '/api/icons/gcp/core-products-icons/Unique Icons/Cloud Storage/SVG/Cloud_Storage-512-color.svg',
        'google_storage_notification': '/api/icons/gcp/core-products-icons/Unique Icons/Cloud Storage/SVG/Cloud_Storage-512-color.svg',
        'google_storage_transfer_job': '/api/icons/gcp/google-cloud-legacy-icons/data_transfer/data_transfer.svg',
        'google_filestore_instance': '/api/icons/gcp/google-cloud-legacy-icons/filestore/filestore.svg',
        'google_filestore_backup': '/api/icons/gcp/google-cloud-legacy-icons/filestore/filestore.svg',
    },
}

def escape_string(s):
    """Escape string for TypeScript"""
    if s is None:
        return 'undefined'
    if isinstance(s, bool):
        return 'true' if s else 'false'
    if isinstance(s, (int, float)):
        return str(s)
    if isinstance(s, list):
        return '[' + ', '.join(escape_string(item) for item in s) + ']'
    if isinstance(s, dict):
        return '{' + ', '.join(f'{k}: {escape_string(v)}' for k, v in s.items()) + '}'
    return json.dumps(str(s))

def format_attr(attr):
    """Format a single attribute"""
    parts = [f'name: {escape_string(attr["name"])}', f'type: {escape_string(attr["type"])}']
    if 'description' in attr:
        parts.append(f'description: {escape_string(attr["description"])}')
    if 'options' in attr:
        parts.append(f'options: {escape_string(attr["options"])}')
    if 'default' in attr:
        parts.append(f'default: {escape_string(attr["default"])}')
    if attr.get('required', False):
        parts.append('required: true')
    if attr.get('sensitive', False):
        parts.append('sensitive: true')
    return '{ ' + ', '.join(parts) + ' }'

def format_block(block, indent=''):
    """Format a block recursively"""
    parts = [f'name: {escape_string(block["name"])}']
    if block.get('required', False):
        parts.append('required: true')
    if block.get('multiple', False):
        parts.append('multiple: true')
    if 'description' in block:
        parts.append(f'description: {escape_string(block["description"])}')
    
    # Format attributes
    attrs = block.get('attributes', [])
    if attrs:
        attr_str = '[\n' + ',\n'.join(f'{indent}      {format_attr(attr)}' for attr in attrs) + f'\n{indent}    ]'
        parts.append(f'attributes: {attr_str}')
    else:
        parts.append('attributes: []')
    
    # Format nested blocks
    nested = block.get('blocks', [])
    if nested:
        block_str = '[\n' + ',\n'.join(format_block(b, indent + '      ') for b in nested) + f'\n{indent}    ]'
        parts.append(f'blocks: {block_str}')
    
    return indent + '    {\n' + ',\n'.join(f'{indent}      {p}' for p in parts) + f'\n{indent}    }}'

def generate_services_file(category, json_file, output_file):
    """Generate TypeScript services data file from JSON"""
    newline = '\n'
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    services = data['services']
    category_name = data.get('categoryName', category.title())
    category_upper = category.upper().replace('-', '_')
    
    # Generate icon mappings
    icon_map = ICONS.get(category, {})
    icon_lines = []
    for service in services:
        terraform_resource = service['terraform_resource']
        icon_path = icon_map.get(terraform_resource, f'/api/icons/gcp/google-cloud-legacy-icons/{category}/{category}.svg')
        icon_lines.append(f"  '{terraform_resource}': '{icon_path}',")
    
    # Generate service definitions
    service_defs = []
    for service in services:
        terraform_resource = service['terraform_resource']
        
        # Format required inputs
        required_inputs = []
        for inp in service['inputs']['required']:
            required_inputs.append(format_attr(inp))
        
        # Format optional inputs
        optional_inputs = []
        for inp in service['inputs']['optional']:
            optional_inputs.append(format_attr(inp))
        
        # Format blocks
        blocks = []
        for block in service['inputs'].get('blocks', []):
            blocks.append(format_block(block))
        
        # Format outputs
        outputs = []
        for out in service['outputs']:
            out_parts = [f'name: {escape_string(out["name"])}', f'type: {escape_string(out["type"])}']
            if 'description' in out:
                out_parts.append(f'description: {escape_string(out["description"])}')
            if out.get('sensitive', False):
                out_parts.append('sensitive: true')
            outputs.append('{ ' + ', '.join(out_parts) + ' }')
        
        service_def = f'''  {{
    id: {escape_string(service["id"])},
    name: {escape_string(service["name"])},
    description: {escape_string(service["description"])},
    terraform_resource: {escape_string(terraform_resource)},
    icon: {category_upper}_ICONS['{terraform_resource}'],
    inputs: {{
      required: [
{newline.join('        ' + inp for inp in required_inputs)}
      ],
      optional: [
{newline.join('        ' + inp for inp in optional_inputs) if optional_inputs else '        // No optional inputs'}
      ],
      blocks: [
{newline.join(blocks) if blocks else '        // No blocks'}
      ]
    }},
    outputs: [
{newline.join('      ' + out for out in outputs)}
    ]
  }}'''
        service_defs.append(service_def)
    
    # Write the complete TypeScript file
    file_content = f'''/**
 * GCP {category_name} Services Data - Complete definitions from {category}.json
 * This file contains ALL {len(services)} {category} services with ALL their properties
 */

// Type definitions
export interface ServiceInput {{
  name: string;
  type: string;
  description?: string;
  example?: string;
  default?: unknown;
  options?: string[];
  reference?: string;
  required?: boolean;
  sensitive?: boolean;
}}

export interface BlockAttribute {{
  name: string;
  type: string;
  description?: string;
  options?: string[];
  default?: unknown;
  required?: boolean;
  sensitive?: boolean;
}}

export interface ServiceBlock {{
  name: string;
  description?: string;
  multiple?: boolean;
  required?: boolean;
  attributes: BlockAttribute[];
  nested_blocks?: ServiceBlock[];
  blocks?: ServiceBlock[];
}}

export interface ServiceOutput {{
  name: string;
  type: string;
  description?: string;
  sensitive?: boolean;
}}

// GCP {category_name} service icon mappings - using GCP core products and legacy icons
export const {category_upper}_ICONS: Record<string, string> = {{
{newline.join(icon_lines)}
}};

// {category_name} service definition interface
export interface {category_name.replace(' ', '').replace('&', '')}ServiceDefinition {{
  id: string;
  name: string;
  description: string;
  terraform_resource: string;
  icon: string;
  inputs: {{
    required: ServiceInput[];
    optional: ServiceInput[];
    blocks?: ServiceBlock[];
  }};
  outputs: ServiceOutput[];
}}

// Complete {category} services data - manually defined
export const {category_upper}_SERVICES: {category_name.replace(' ', '').replace('&', '')}ServiceDefinition[] = [
{newline.join(service_defs)}
];

// All {category} terraform resources
export const {category_upper}_TERRAFORM_RESOURCES = {category_upper}_SERVICES.map(s => s.terraform_resource);

// Get {category} service by terraform resource name
export function get{category_name.replace(' ', '').replace('&', '')}ServiceByTerraformResource(terraformResource: string): {category_name.replace(' ', '').replace('&', '')}ServiceDefinition | undefined {{
  return {category_upper}_SERVICES.find(service => service.terraform_resource === terraformResource);
}}

// Get {category} service by ID
export function get{category_name.replace(' ', '').replace('&', '')}ServiceById(id: string): {category_name.replace(' ', '').replace('&', '')}ServiceDefinition | undefined {{
  return {category_upper}_SERVICES.find(service => service.id === id);
}}

// Check if a terraform resource is a {category} resource
export function is{category_name.replace(' ', '').replace('&', '')}Resource(terraformResource: string): boolean {{
  return {category_upper}_TERRAFORM_RESOURCES.includes(terraformResource);
}}

// Get {category} icon
export function get{category_name.replace(' ', '').replace('&', '')}Icon(terraformResource: string): string | undefined {{
  return {category_upper}_ICONS[terraformResource];
}}
'''
    
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(file_content)
    
    print(f"Generated {output_file}: {len(services)} services")
    return len(services)

def generate_catalog_file(category, output_file):
    """Generate TypeScript catalog file"""
    category_upper = category.upper().replace('-', '_')
    category_name = category.title().replace('-', ' ')
    
    file_content = f'''/**
 * GCP {category_name} Catalog - For ResourcePalette display
 * This provides the catalog entries that appear in the resource palette
 */

import {{ {category_upper}_SERVICES, {category_upper}_ICONS }} from './{category}ServicesData';

export interface {category_name.replace(' ', '').replace('&', '')}CatalogEntry {{
  type: string;
  label: string;
  provider: 'gcp';
  category: '{category}';
  originalCategory: string;
  description: string;
  icon: string;
}}

// Convert {category} services to catalog entries
export const {category_upper}_CATALOG: {category_name.replace(' ', '').replace('&', '')}CatalogEntry[] = {category_upper}_SERVICES.map(service => ({{
  type: service.terraform_resource,
  label: service.name,
  provider: 'gcp' as const,
  category: '{category}' as const,
  originalCategory: '{category_name}',
  description: service.description,
  icon: service.icon,
}}));

// All {category} resource types
export const {category_upper}_RESOURCE_TYPES = {category_upper}_SERVICES.map(s => s.terraform_resource);

// Check if a resource type is a {category} resource
export function is{category_name.replace(' ', '').replace('&', '')}Type(resourceType: string): boolean {{
  return {category_upper}_RESOURCE_TYPES.includes(resourceType);
}}

// Get {category} catalog entry by resource type
export function get{category_name.replace(' ', '').replace('&', '')}CatalogEntry(resourceType: string): {category_name.replace(' ', '').replace('&', '')}CatalogEntry | undefined {{
  return {category_upper}_CATALOG.find(entry => entry.type === resourceType);
}}

// Get {category} service icon
export function get{category_name.replace(' ', '').replace('&', '')}ServiceIcon(resourceType: string): string {{
  return {category_upper}_ICONS[resourceType] || {category_upper}_ICONS[{category_upper}_SERVICES[0].terraform_resource];
}}

// List all {category} services
export function list{category_name.replace(' ', '').replace('&', '')}Services(): {category_name.replace(' ', '').replace('&', '')}CatalogEntry[] {{
  return {category_upper}_CATALOG;
}}
'''
    
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(file_content)
    
    print(f"Generated {output_file}")

if __name__ == '__main__':
    base_dir = Path(__file__).parent
    frontend_dir = base_dir / 'frontend' / 'src' / 'lib' / 'gcp'
    
    categories = ['messaging', 'networking', 'security', 'serverless', 'storage']
    
    for category in categories:
        json_file = base_dir / 'gcp-services' / f'{category}.json'
        if json_file.exists():
            services_file = frontend_dir / f'{category}ServicesData.ts'
            catalog_file = frontend_dir / f'{category}Catalog.ts'
            
            count = generate_services_file(category, json_file, services_file)
            generate_catalog_file(category, catalog_file)
            print(f"[OK] {category}: {count} services\n")

