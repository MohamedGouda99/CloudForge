#!/usr/bin/env python3
"""
Generate GCP service TypeScript files from JSON definitions
"""
import json
import os
from pathlib import Path

def convert_block(block):
    """Convert JSON block to TypeScript block structure"""
    result = {
        'name': block['name'],
        'required': block.get('required', False),
        'multiple': block.get('multiple', False),
    }
    if 'description' in block:
        result['description'] = block['description']
    
    # Convert attributes
    attrs = []
    for attr in block.get('attributes', []):
        attr_obj = {
            'name': attr['name'],
            'type': attr['type'],
        }
        if 'description' in attr:
            attr_obj['description'] = attr['description']
        if 'options' in attr:
            attr_obj['options'] = attr['options']
        if 'default' in attr:
            attr_obj['default'] = attr['default']
        if attr.get('required', False):
            attr_obj['required'] = True
        if attr.get('sensitive', False):
            attr_obj['sensitive'] = True
        attrs.append(attr_obj)
    result['attributes'] = attrs
    
    # Convert nested blocks
    if 'blocks' in block:
        result['blocks'] = [convert_block(b) for b in block['blocks']]
    
    return result

def generate_services_file(category, json_file, output_file, icons_map):
    """Generate TypeScript services data file from JSON"""
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    services = data['services']
    category_name = data.get('categoryName', category.title())
    
    # Generate icon mappings
    icon_lines = []
    for service in services:
        terraform_resource = service['terraform_resource']
        icon_path = icons_map.get(terraform_resource, f'/api/icons/gcp/google-cloud-legacy-icons/{category}/{category}.svg')
        icon_lines.append(f"  '{terraform_resource}': '{icon_path}',")
    
    # Generate service definitions
    service_defs = []
    for service in services:
        service_obj = {
            'id': service['id'],
            'name': service['name'],
            'description': service['description'],
            'terraform_resource': service['terraform_resource'],
            'icon': f"{category.upper()}_ICONS['{service['terraform_resource']}']",
            'inputs': {
                'required': service['inputs']['required'],
                'optional': service['inputs']['optional'],
                'blocks': [convert_block(b) for b in service['inputs'].get('blocks', [])]
            },
            'outputs': service['outputs']
        }
        service_defs.append(service_obj)
    
    # Write TypeScript file
    # Note: This is a simplified version - full implementation would format the entire file
    print(f"Generated structure for {category}: {len(services)} services")
    return service_defs, icon_lines

# Icon mappings for each service
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

if __name__ == '__main__':
    base_dir = Path(__file__).parent
    for category in ['messaging', 'networking', 'security', 'serverless', 'storage']:
        json_file = base_dir / 'gcp-services' / f'{category}.json'
        if json_file.exists():
            services, icons = generate_services_file(
                category, 
                json_file, 
                base_dir / 'frontend' / 'src' / 'lib' / 'gcp' / f'{category}ServicesData.ts',
                ICONS.get(category, {})
            )
            print(f"{category}: {len(services)} services, {len(icons)} icons")

