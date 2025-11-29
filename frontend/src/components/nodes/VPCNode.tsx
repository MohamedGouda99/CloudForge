import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import CloudIcon from '../CloudIcon';
import { getCloudIcon } from '../../lib/icons/cloudIcons';

interface VPCNodeData {
  label: string;
  resourceType: string;
  resourceLabel: string;
  config: any;
}

function VPCNode({ data, selected }: NodeProps<VPCNodeData>) {
  const vpcName = data.config?.name || data.config?.cidr_block || 'VPC';
  const cidr = data.config?.cidr_block || '';
  const icon = getCloudIcon(data.resourceType);

  return (
    <div
      style={{
        background: 'rgba(147, 51, 234, 0.05)',
        border: selected ? '3px solid #9333ea' : '2px solid #9333ea',
        borderRadius: '12px',
        padding: '20px',
        minWidth: '400px',
        minHeight: '300px',
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
          background: '#9333ea',
          color: 'white',
          padding: '8px 12px',
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px',
          fontWeight: 'bold',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <CloudIcon icon={icon} size={20} />
        <span>{vpcName}</span>
        {cidr && (
          <span style={{ fontSize: '12px', opacity: 0.9 }}>({cidr})</span>
        )}
      </div>

      {/* Drop zone label */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#9333ea',
          fontSize: '14px',
          opacity: 0.3,
          pointerEvents: 'none',
          textAlign: 'center',
        }}
      >
        Drag subnets and resources here
      </div>

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#9333ea' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#9333ea' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#9333ea' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#9333ea' }}
      />
    </div>
  );
}

export default memo(VPCNode);
