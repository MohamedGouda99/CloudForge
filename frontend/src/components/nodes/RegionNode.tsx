import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface RegionNodeData {
  label: string;
  resourceType: string;
  resourceLabel: string;
  config: any;
}

function RegionNode({ data, selected }: NodeProps<RegionNodeData>) {
  const regionName = data.config?.region || data.config?.name || 'Region';

  return (
    <div
      style={{
        background: 'rgba(16, 185, 129, 0.03)',
        border: selected ? '3px dashed #10b981' : '2px dashed #10b981',
        borderRadius: '16px',
        padding: '24px',
        minWidth: '600px',
        minHeight: '450px',
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
          background: '#10b981',
          color: 'white',
          padding: '10px 16px',
          borderTopLeftRadius: '14px',
          borderTopRightRadius: '14px',
          fontWeight: 'bold',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <span>🌎</span>
        <span>Region: {regionName}</span>
      </div>

      {/* Drop zone label */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#10b981',
          fontSize: '16px',
          opacity: 0.2,
          pointerEvents: 'none',
          textAlign: 'center',
        }}
      >
        Drag VPCs and availability zones here
      </div>

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#10b981' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#10b981' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#10b981' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#10b981' }}
      />
    </div>
  );
}

export default memo(RegionNode);
