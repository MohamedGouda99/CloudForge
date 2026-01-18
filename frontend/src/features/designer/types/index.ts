/**
 * Type definitions for the Designer feature
 */

import type { CloudProvider } from '../../../lib/resources';

export interface Project {
  id: number;
  name: string;
  description: string;
  cloud_provider: CloudProvider;
  diagram_data: DiagramData | null;
}

export interface DiagramData {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface DiagramNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
  parentNode?: string;
  extent?: 'parent';
  style?: {
    width?: number;
    height?: number;
  };
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  data?: Record<string, unknown>;
}

export interface NodeData {
  resourceType: string;
  resourceLabel: string;
  resourceCategory?: string;
  resourceDescription?: string;
  displayName: string;
  config: Record<string, unknown>;
  size?: {
    width: number;
    height: number;
  };
}

export type PlanStatus = 'idle' | 'running' | 'success' | 'error';
export type DeployStatus = 'idle' | 'running' | 'success' | 'error';
export type DeployMode = 'plan' | 'validate' | 'apply' | 'destroy';
export type TerraformAction =
  | 'download'
  | 'plan'
  | 'apply'
  | 'destroy'
  | 'validate'
  | 'tfsec'
  | 'terrascan'
  | 'infracost'
  | null;
export type LogsPanelOperation =
  | 'validate'
  | 'plan'
  | 'apply'
  | 'destroy'
  | 'tfsec'
  | 'terrascan'
  | null;
export type InspectorTab = 'resources' | 'code' | 'issues' | 'deploy' | 'ai';

export interface ContextMenuState {
  x: number;
  y: number;
  nodeId: string;
}

export interface EditTitleModalState {
  isOpen: boolean;
  nodeId: string;
  currentTitle: string;
}

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  actionType: 'apply' | 'destroy' | 'warning';
  onConfirm: () => void;
  isLoading?: boolean;
}

export interface CloudCredentials {
  // AWS
  aws_region?: string;
  aws_access_key_id?: string;
  aws_secret_access_key?: string;
  aws_endpoint_url?: string;
  // Azure
  azure_subscription_id?: string;
  azure_tenant_id?: string;
  azure_client_id?: string;
  azure_client_secret?: string;
  azure_location?: string;
  // GCP
  gcp_project_id?: string;
  gcp_region?: string;
  gcp_credentials_json?: string;
}
