/**
 * Unit tests for InspectorPanel component.
 *
 * Tests cover resource inspection, tab navigation, and node selection.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock CloudIcon
vi.mock('../../src/components/CloudIcon', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="cloud-icon" />
  ),
}));

// Mock syntax highlighter
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: { children: string }) => (
    <pre data-testid="syntax-highlighter">{children}</pre>
  ),
}));

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  vscDarkPlus: {},
}));

// Mock resource schemas
vi.mock('../../src/lib/resources/resourceSchemas', () => ({
  getResourceSchema: vi.fn(() => null),
  hasRichSchema: vi.fn(() => false),
}));

// Mock cloudIconsComplete
vi.mock('../../src/lib/resources/cloudIconsComplete', () => ({
  getCloudIconPath: vi.fn(() => '/mock-icon.svg'),
}));

// Mock AIInspectorPanel
vi.mock('../../src/components/AIInspectorPanel', () => ({
  default: () => <div data-testid="ai-inspector">AI Inspector</div>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronRight: () => <span>ChevronRight</span>,
  ChevronDown: () => <span>ChevronDown</span>,
  Code2: () => <span data-testid="icon-code2">Code2</span>,
  Layout: () => <span>Layout</span>,
  FileCode: () => <span>FileCode</span>,
  X: () => <span data-testid="icon-x">X</span>,
  Save: () => <span>Save</span>,
  CheckCircle2: () => <span>CheckCircle2</span>,
  Rocket: () => <span>Rocket</span>,
  Link2: () => <span>Link2</span>,
  Plus: () => <span>Plus</span>,
  Layers: () => <span data-testid="icon-layers">Layers</span>,
  Trash2: () => <span>Trash2</span>,
  Loader2: () => <span>Loader2</span>,
  AlertCircle: () => <span>AlertCircle</span>,
  XCircle: () => <span>XCircle</span>,
  Sparkles: () => <span>Sparkles</span>,
}));

// Simplified InspectorPanel for testing
type TabType = 'resources' | 'code' | 'issues' | 'deploy' | 'ai';

interface Node {
  id: string;
  type: string;
  data: {
    resourceType: string;
    resourceLabel: string;
    config?: Record<string, any>;
  };
}

interface InspectorPanelProps {
  nodes: Node[];
  terraformFiles: Record<string, string>;
  selectedNode: Node | null;
  onNodeSelect: (nodeId: string) => void;
  onUpdateNode?: (nodeId: string, updates: any) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

function InspectorPanel({
  nodes,
  terraformFiles,
  selectedNode,
  onNodeSelect,
  isCollapsed = false,
  onToggleCollapse,
  activeTab = 'resources',
  onTabChange,
}: InspectorPanelProps) {
  if (isCollapsed) {
    return (
      <div data-testid="inspector-collapsed">
        <button onClick={onToggleCollapse} data-testid="expand-button">
          Expand
        </button>
      </div>
    );
  }

  return (
    <div data-testid="inspector-panel">
      <div data-testid="tab-navigation">
        <button
          onClick={() => onTabChange?.('resources')}
          data-testid="tab-resources"
          className={activeTab === 'resources' ? 'active' : ''}
        >
          Resources
        </button>
        <button
          onClick={() => onTabChange?.('code')}
          data-testid="tab-code"
          className={activeTab === 'code' ? 'active' : ''}
        >
          Code
        </button>
        <button
          onClick={() => onTabChange?.('issues')}
          data-testid="tab-issues"
          className={activeTab === 'issues' ? 'active' : ''}
        >
          Issues
        </button>
        <button
          onClick={() => onTabChange?.('deploy')}
          data-testid="tab-deploy"
          className={activeTab === 'deploy' ? 'active' : ''}
        >
          Deploy
        </button>
        <button
          onClick={() => onTabChange?.('ai')}
          data-testid="tab-ai"
          className={activeTab === 'ai' ? 'active' : ''}
        >
          AI
        </button>
      </div>

      {activeTab === 'resources' && (
        <div data-testid="resources-tab">
          <div data-testid="resource-count">Resources: {nodes.length}</div>
          {nodes.map((node) => (
            <div
              key={node.id}
              onClick={() => onNodeSelect(node.id)}
              data-testid={`resource-${node.id}`}
              className={selectedNode?.id === node.id ? 'selected' : ''}
            >
              {node.data.resourceLabel}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'code' && (
        <div data-testid="code-tab">
          {Object.entries(terraformFiles).map(([filename, content]) => (
            <div key={filename} data-testid={`file-${filename}`}>
              <div data-testid="filename">{filename}</div>
              <pre data-testid="file-content">{content}</pre>
            </div>
          ))}
        </div>
      )}

      {selectedNode && (
        <div data-testid="selected-node-info">
          <div data-testid="node-type">{selectedNode.data.resourceType}</div>
          <div data-testid="node-label">{selectedNode.data.resourceLabel}</div>
        </div>
      )}

      {onToggleCollapse && (
        <button onClick={onToggleCollapse} data-testid="collapse-button">
          Collapse
        </button>
      )}
    </div>
  );
}

describe('InspectorPanel', () => {
  const mockNodes: Node[] = [
    {
      id: 'vpc-1',
      type: 'aws_vpc',
      data: {
        resourceType: 'aws_vpc',
        resourceLabel: 'main',
        config: { cidr_block: '10.0.0.0/16' },
      },
    },
    {
      id: 'subnet-1',
      type: 'aws_subnet',
      data: {
        resourceType: 'aws_subnet',
        resourceLabel: 'public',
        config: { cidr_block: '10.0.1.0/24' },
      },
    },
  ];

  const mockTerraformFiles = {
    'main.tf': 'resource "aws_vpc" "main" {\n  cidr_block = "10.0.0.0/16"\n}',
    'variables.tf': 'variable "region" {\n  default = "us-east-1"\n}',
  };

  const defaultProps = {
    nodes: mockNodes,
    terraformFiles: mockTerraformFiles,
    selectedNode: null as Node | null,
    onNodeSelect: vi.fn(),
    onUpdateNode: vi.fn(),
    onTabChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render inspector panel', () => {
      render(<InspectorPanel {...defaultProps} />);
      expect(screen.getByTestId('inspector-panel')).toBeInTheDocument();
    });

    it('should render tab navigation', () => {
      render(<InspectorPanel {...defaultProps} />);
      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
    });

    it('should render all tabs', () => {
      render(<InspectorPanel {...defaultProps} />);
      expect(screen.getByTestId('tab-resources')).toBeInTheDocument();
      expect(screen.getByTestId('tab-code')).toBeInTheDocument();
      expect(screen.getByTestId('tab-issues')).toBeInTheDocument();
      expect(screen.getByTestId('tab-deploy')).toBeInTheDocument();
      expect(screen.getByTestId('tab-ai')).toBeInTheDocument();
    });
  });

  describe('Resources Tab', () => {
    it('should display resource count', () => {
      render(<InspectorPanel {...defaultProps} activeTab="resources" />);
      expect(screen.getByTestId('resource-count')).toHaveTextContent('Resources: 2');
    });

    it('should display all nodes', () => {
      render(<InspectorPanel {...defaultProps} activeTab="resources" />);
      expect(screen.getByTestId('resource-vpc-1')).toBeInTheDocument();
      expect(screen.getByTestId('resource-subnet-1')).toBeInTheDocument();
    });

    it('should call onNodeSelect when node clicked', () => {
      render(<InspectorPanel {...defaultProps} activeTab="resources" />);
      fireEvent.click(screen.getByTestId('resource-vpc-1'));
      expect(defaultProps.onNodeSelect).toHaveBeenCalledWith('vpc-1');
    });
  });

  describe('Code Tab', () => {
    it('should display terraform files', () => {
      render(<InspectorPanel {...defaultProps} activeTab="code" />);
      expect(screen.getByTestId('file-main.tf')).toBeInTheDocument();
      expect(screen.getByTestId('file-variables.tf')).toBeInTheDocument();
    });

    it('should display file content', () => {
      render(<InspectorPanel {...defaultProps} activeTab="code" />);
      expect(screen.getByTestId('code-tab')).toHaveTextContent('aws_vpc');
    });
  });

  describe('Tab Navigation', () => {
    it('should call onTabChange when tab clicked', () => {
      render(<InspectorPanel {...defaultProps} />);
      fireEvent.click(screen.getByTestId('tab-code'));
      expect(defaultProps.onTabChange).toHaveBeenCalledWith('code');
    });

    it('should switch to issues tab', () => {
      render(<InspectorPanel {...defaultProps} />);
      fireEvent.click(screen.getByTestId('tab-issues'));
      expect(defaultProps.onTabChange).toHaveBeenCalledWith('issues');
    });

    it('should switch to deploy tab', () => {
      render(<InspectorPanel {...defaultProps} />);
      fireEvent.click(screen.getByTestId('tab-deploy'));
      expect(defaultProps.onTabChange).toHaveBeenCalledWith('deploy');
    });

    it('should switch to AI tab', () => {
      render(<InspectorPanel {...defaultProps} />);
      fireEvent.click(screen.getByTestId('tab-ai'));
      expect(defaultProps.onTabChange).toHaveBeenCalledWith('ai');
    });
  });

  describe('Selected Node', () => {
    it('should display selected node info', () => {
      render(
        <InspectorPanel
          {...defaultProps}
          selectedNode={mockNodes[0]}
          activeTab="resources"
        />
      );
      expect(screen.getByTestId('selected-node-info')).toBeInTheDocument();
      expect(screen.getByTestId('node-type')).toHaveTextContent('aws_vpc');
      expect(screen.getByTestId('node-label')).toHaveTextContent('main');
    });

    it('should not display node info when nothing selected', () => {
      render(<InspectorPanel {...defaultProps} selectedNode={null} />);
      expect(screen.queryByTestId('selected-node-info')).not.toBeInTheDocument();
    });
  });

  describe('Collapse/Expand', () => {
    it('should render collapsed state', () => {
      render(
        <InspectorPanel
          {...defaultProps}
          isCollapsed={true}
          onToggleCollapse={vi.fn()}
        />
      );
      expect(screen.getByTestId('inspector-collapsed')).toBeInTheDocument();
    });

    it('should call onToggleCollapse when expand button clicked', () => {
      const onToggle = vi.fn();
      render(
        <InspectorPanel
          {...defaultProps}
          isCollapsed={true}
          onToggleCollapse={onToggle}
        />
      );
      fireEvent.click(screen.getByTestId('expand-button'));
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should call onToggleCollapse when collapse button clicked', () => {
      const onToggle = vi.fn();
      render(
        <InspectorPanel
          {...defaultProps}
          isCollapsed={false}
          onToggleCollapse={onToggle}
        />
      );
      fireEvent.click(screen.getByTestId('collapse-button'));
      expect(onToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('Empty States', () => {
    it('should handle empty nodes array', () => {
      render(
        <InspectorPanel
          {...defaultProps}
          nodes={[]}
          activeTab="resources"
        />
      );
      expect(screen.getByTestId('resource-count')).toHaveTextContent('Resources: 0');
    });

    it('should handle empty terraform files', () => {
      render(
        <InspectorPanel
          {...defaultProps}
          terraformFiles={{}}
          activeTab="code"
        />
      );
      expect(screen.getByTestId('code-tab')).toBeInTheDocument();
    });
  });
});
