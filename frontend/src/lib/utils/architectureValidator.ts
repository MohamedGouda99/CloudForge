import { Node, Edge } from 'reactflow';

export interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  nodeId?: string;
  fix?: () => void;
}

/**
 * Validate architecture for best practices and common issues
 */
export function validateArchitecture(nodes: Node[], edges: Edge[], provider: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check for isolated nodes (no connections)
  const connectedNodeIds = new Set<string>();
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  nodes.forEach(node => {
    if (!connectedNodeIds.has(node.id) && nodes.length > 1) {
      issues.push({
        id: `isolated-${node.id}`,
        type: 'warning',
        title: 'Isolated Resource',
        description: `${node.data?.displayName || 'Resource'} is not connected to any other resources`,
        nodeId: node.id,
      });
    }
  });

  // Check for VPC best practices (AWS)
  if (provider === 'aws') {
    const hasVPC = nodes.some(n => n.data?.resourceType === 'aws_vpc');
    const hasEC2 = nodes.some(n => n.data?.resourceType === 'aws_instance');
    const hasSubnet = nodes.some(n => n.data?.resourceType === 'aws_subnet');

    if (hasEC2 && !hasVPC) {
      issues.push({
        id: 'no-vpc',
        type: 'error',
        title: 'Missing VPC',
        description: 'EC2 instances should be deployed within a VPC for security',
      });
    }

    if (hasVPC && !hasSubnet) {
      issues.push({
        id: 'no-subnet',
        type: 'warning',
        title: 'Missing Subnet',
        description: 'VPC should have at least one subnet defined',
      });
    }

    const hasDB = nodes.some(n => n.data?.resourceType === 'aws_db_instance');
    const hasBackup = nodes.some(n => n.data?.resourceType === 'aws_backup_plan');
    
    if (hasDB && !hasBackup) {
      issues.push({
        id: 'no-db-backup',
        type: 'warning',
        title: 'No Database Backup',
        description: 'Consider adding AWS Backup for database disaster recovery',
      });
    }

    const hasPublicInstance = nodes.some(n => 
      n.data?.resourceType === 'aws_instance' && 
      n.data?.config?.associate_public_ip_address
    );
    
    if (hasPublicInstance) {
      issues.push({
        id: 'public-instance',
        type: 'warning',
        title: 'Public Instance',
        description: 'EC2 instance has public IP. Consider using a bastion host or VPN',
      });
    }
  }

  // Check for unconfigured resources
  nodes.forEach(node => {
    const hasConfig = node.data?.config && Object.keys(node.data.config).length > 0;
    if (!hasConfig && node.data?.resourceType) {
      issues.push({
        id: `unconfig-${node.id}`,
        type: 'info',
        title: 'Unconfigured Resource',
        description: `${node.data?.displayName || 'Resource'} needs configuration`,
        nodeId: node.id,
      });
    }
  });

  // Security best practices
  const hasIAM = nodes.some(n => n.data?.resourceType?.includes('iam'));
  const hasKMS = nodes.some(n => n.data?.resourceType?.includes('kms') || n.data?.resourceType?.includes('key_vault'));
  
  if (nodes.length > 3 && !hasIAM) {
    issues.push({
      id: 'no-iam',
      type: 'info',
      title: 'Consider IAM Roles',
      description: 'Add IAM roles for secure service-to-service authentication',
    });
  }

  if (nodes.some(n => n.data?.resourceType?.includes('db')) && !hasKMS) {
    issues.push({
      id: 'no-encryption',
      type: 'warning',
      title: 'Encryption Recommended',
      description: 'Add KMS key for database encryption at rest',
    });
  }

  return issues;
}

/**
 * Check if a connection between two nodes is valid
 */
export function isValidConnection(sourceNode: Node, targetNode: Node): { valid: boolean; message?: string } {
  const sourceType = sourceNode.data?.resourceType;
  const targetType = targetNode.data?.resourceType;

  if (!sourceType || !targetType) {
    return { valid: true };
  }

  // VPC can connect to most resources
  if (sourceType.includes('vpc') || targetType.includes('vpc')) {
    return { valid: true };
  }

  // Subnet connections
  if (sourceType.includes('subnet')) {
    if (targetType.includes('instance') || targetType.includes('db_') || targetType.includes('lb')) {
      return { valid: true };
    }
  }

  // Load balancer to instances
  if (sourceType.includes('lb') && targetType.includes('instance')) {
    return { valid: true };
  }

  // Instance to database
  if (sourceType.includes('instance') && targetType.includes('db_')) {
    return { valid: true };
  }

  // Instance to S3
  if (sourceType.includes('instance') && targetType.includes('s3')) {
    return { valid: true };
  }

  // Security group connections
  if (sourceType.includes('security_group')) {
    return { valid: true };
  }

  return { 
    valid: true, 
    message: 'Connection may not follow best practices' 
  };
}

/**
 * Get recommended resources based on what's already in the diagram
 */
export function getRecommendedResources(nodes: Node[], provider: string): CloudResource[] {
  const recommendations: CloudResource[] = [];
  
  // This would integrate with AI/ML model in production
  // For now, return rule-based recommendations
  
  return recommendations;
}

