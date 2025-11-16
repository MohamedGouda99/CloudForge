const CATEGORY_COLORS: Record<string, string> = {
  terraform: '#7c5dfa',
  tfsec: '#ff9f43',
  terrascan: '#ff9f43',
  checkov: '#ff9f43',
  infracost: '#36cfc9',
  slack: '#a855f7',
  email: '#a855f7',
  webhook: '#a855f7',
  manual: '#f87171',
  conditional: '#f87171',
  custom: '#94a3b8',
  http: '#94a3b8',
};

const TYPE_ICONS: Record<string, string> = {
  terraform_validate: '✓',
  terraform_plan: '📋',
  terraform_apply: '🚀',
  terraform_destroy: '🗑️',
  tfsec_scan: '🛡️',
  terrascan_scan: '📡',
  checkov_scan: '⚠️',
  infracost_estimate: '💰',
  slack_notification: '💬',
  email_notification: '✉️',
  webhook_notification: '🌐',
  manual_approval: '⏳',
  conditional: '🔀',
  custom_script: '⚙️',
  http_request: '📡',
};

export const getNodeCategory = (nodeType: string): string => {
  if (!nodeType) {
    return 'custom';
  }
  return nodeType.split('_')[0] || 'custom';
};

export const getNodeColor = (nodeType: string): string => {
  const category = getNodeCategory(nodeType);
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.custom;
};

export const getNodeIcon = (nodeType: string): string => {
  return TYPE_ICONS[nodeType] || '✨';
};
