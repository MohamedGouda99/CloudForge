import terraformIcon from '@/assets/cicd/terraform.svg';
import infracostIcon from '@/assets/cicd/infracost.jpg';
import tfsecIcon from '@/assets/cicd/tfsec.jpg';
import terrascanIcon from '@/assets/cicd/terrascan.jpg';

const terraformNodes = ['terraform_validate', 'terraform_plan', 'terraform_apply', 'terraform_destroy'];

const TOOL_ICON_MAP: Record<string, string> = {
  infracost_estimate: infracostIcon,
  tfsec_scan: tfsecIcon,
  terrascan_scan: terrascanIcon,
};

terraformNodes.forEach((nodeType) => {
  TOOL_ICON_MAP[nodeType] = terraformIcon;
});

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
