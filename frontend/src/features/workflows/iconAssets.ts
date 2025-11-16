import terraformIcon from '../../assets/cicd/terraform.svg';
import infracostIcon from '../../assets/cicd/infracost.jpg';
import tfsecIcon from '../../assets/cicd/tfsec.jpg';
import terrascanIcon from '../../assets/cicd/terrascan.jpg';

const TOOL_ICON_MAP: Record<string, string> = {
  // Terraform - single unified node
  terraform: terraformIcon,
  // Legacy terraform nodes (for backward compatibility)
  terraform_validate: terraformIcon,
  terraform_plan: terraformIcon,
  terraform_apply: terraformIcon,
  terraform_destroy: terraformIcon,
  // Security tools
  infracost_estimate: infracostIcon,
  tfsec_scan: tfsecIcon,
  terrascan_scan: terrascanIcon,
};

// Allow historical node_type values to keep working with the same artwork
const TYPE_ALIASES: Record<string, string> = {
  infracost: 'infracost_estimate',
  tfsec: 'tfsec_scan',
  terrascan: 'terrascan_scan',
};

export const CICD_TOOL_ICONS: Record<string, string> = TOOL_ICON_MAP;

export const getToolIcon = (nodeType: string): string | undefined => {
  const normalized = TYPE_ALIASES[nodeType] ?? nodeType;
  return CICD_TOOL_ICONS[normalized];
};
