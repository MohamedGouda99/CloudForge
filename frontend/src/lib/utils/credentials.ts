export type CloudProvider = 'aws' | 'azure' | 'gcp';

export function buildCredentialsQuery(cloudProvider: CloudProvider, credentials: any): string {
  if (!credentials) {
    return '';
  }

  if (cloudProvider === 'aws') {
    const params: Record<string, string> = {
      aws_region: credentials.aws_region ?? '',
      aws_access_key_id: credentials.aws_access_key_id ?? '',
      aws_secret_access_key: credentials.aws_secret_access_key ?? '',
    };
    // Add endpoint URL if provided (for LocalStack/custom endpoints)
    if (credentials.aws_endpoint_url) {
      params.aws_endpoint_url = credentials.aws_endpoint_url;
    }
    return new URLSearchParams(params).toString();
  }

  if (cloudProvider === 'azure') {
    return new URLSearchParams({
      azure_subscription_id: credentials.azure_subscription_id ?? '',
      azure_tenant_id: credentials.azure_tenant_id ?? '',
      azure_client_id: credentials.azure_client_id ?? '',
      azure_client_secret: credentials.azure_client_secret ?? '',
      azure_location: credentials.azure_location ?? '',
    }).toString();
  }

  if (cloudProvider === 'gcp') {
    return new URLSearchParams({
      gcp_project_id: credentials.gcp_project_id ?? '',
      gcp_region: credentials.gcp_region ?? '',
      gcp_credentials_json: credentials.gcp_credentials_json ?? '',
    }).toString();
  }

  return '';
}
