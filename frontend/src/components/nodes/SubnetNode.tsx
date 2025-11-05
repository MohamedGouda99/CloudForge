import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface SubnetNodeData {
  label: string;
  resourceType: string;
  resourceLabel: string;
  config: any;
  isPublic?: boolean;
}

function SubnetNode({ data, selected }: NodeProps<SubnetNodeData>) {
  const subnetName = data.config?.name || data.config?.cidr_block || 'Subnet';
  const cidr = data.config?.cidr_block || '';
  const isPublic = data.config?.map_public_ip_on_launch || data.isPublic || false;

  // Public subnets are orange, private are blue
  const color = isPublic ? '#f97316' : '#3b82f6';
  const bgColor = isPublic ? 'rgba(249, 115, 22, 0.05)' : 'rgba(59, 130, 246, 0.05)';

  return (
    <div
      style={{
        background: bgColor,
        border: selected ? `3px solid ${color}` : `2px solid ${color}`,
        borderRadius: '8px',
        padding: '16px',
        minWidth: '250px',
        minHeight: '180px',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          background: color,
          color: 'white',
          padding: '6px 10px',
          borderTopLeftRadius: '6px',
          borderTopRightRadius: '6px',
          fontWeight: '600',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span>🔗</span>
        <span>{subnetName}</span>
        <span style={{ fontSize: '10px', opacity: 0.9 }}>
          {isPublic ? '(Public)' : '(Private)'}
        </span>
      </div>

      {/* CIDR display */}
      {cidr && (
        <div
          style={{
            position: 'absolute',
            top: '32px',
            left: '10px',
            fontSize: '10px',
            color: color,
            opacity: 0.7,
          }}
        >
          {cidr}
        </div>
      )}

      {/* Drop zone label */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: color,
          fontSize: '11px',
          opacity: 0.3,
          pointerEvents: 'none',
          textAlign: 'center',
        }}
      >
        Drag resources here
      </div>

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: color }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: color }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: color }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: color }}
      />
    </div>
  );
}

export default memo(SubnetNode);
