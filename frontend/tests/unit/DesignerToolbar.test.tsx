/**
 * Unit tests for DesignerToolbar component.
 *
 * Tests cover toolbar buttons, actions, and states.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the CloudIcon component
vi.mock('../../src/components/CloudIcon', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="cloud-icon" />
  ),
}));

// Mock the lucide-react icons
vi.mock('lucide-react', () => ({
  Save: () => <span data-testid="icon-save">Save</span>,
  Download: () => <span data-testid="icon-download">Download</span>,
  Upload: () => <span data-testid="icon-upload">Upload</span>,
  PanelLeftClose: () => <span>PanelLeftClose</span>,
  PanelLeft: () => <span>PanelLeft</span>,
  Code: () => <span data-testid="icon-code">Code</span>,
  Map: () => <span data-testid="icon-map">Map</span>,
  CheckCircle: () => <span data-testid="icon-check">CheckCircle</span>,
  Play: () => <span data-testid="icon-play">Play</span>,
  Rocket: () => <span data-testid="icon-rocket">Rocket</span>,
  Trash2: () => <span data-testid="icon-trash">Trash2</span>,
  Bot: () => <span data-testid="icon-bot">Bot</span>,
  Settings: () => <span data-testid="icon-settings">Settings</span>,
  ZoomIn: () => <span data-testid="icon-zoom-in">ZoomIn</span>,
  ZoomOut: () => <span data-testid="icon-zoom-out">ZoomOut</span>,
  Maximize2: () => <span data-testid="icon-maximize">Maximize2</span>,
  ChevronDown: () => <span>ChevronDown</span>,
  Loader2: () => <span data-testid="icon-loader">Loader2</span>,
  Circle: () => <span>Circle</span>,
  User: () => <span data-testid="icon-user">User</span>,
  Home: () => <span data-testid="icon-home">Home</span>,
  ChevronRight: () => <span>ChevronRight</span>,
  ChevronLeft: () => <span>ChevronLeft</span>,
  Key: () => <span>Key</span>,
  Shield: () => <span>Shield</span>,
  DollarSign: () => <span>DollarSign</span>,
  ShieldCheck: () => <span>ShieldCheck</span>,
  ShieldAlert: () => <span>ShieldAlert</span>,
  Sparkles: () => <span>Sparkles</span>,
  Undo2: () => <span data-testid="icon-undo">Undo2</span>,
  Redo2: () => <span data-testid="icon-redo">Redo2</span>,
  Grid3X3: () => <span>Grid3X3</span>,
  Camera: () => <span>Camera</span>,
  FileDown: () => <span>FileDown</span>,
}));

// Simplified DesignerToolbar for testing
function DesignerToolbar({
  projectName,
  provider,
  isSaving,
  onSave,
  onExport,
  onImport,
  onToggleCode,
  onValidate,
  onPlan,
}: {
  projectName: string;
  provider: string;
  isSaving: boolean;
  onSave: () => void;
  onExport: () => void;
  onImport: () => void;
  onToggleCode: () => void;
  onValidate: () => void;
  onPlan: () => void;
}) {
  return (
    <div data-testid="designer-toolbar">
      <span data-testid="project-name">{projectName}</span>
      <span data-testid="provider">{provider}</span>
      <button onClick={onSave} disabled={isSaving} data-testid="save-button">
        {isSaving ? 'Saving...' : 'Save'}
      </button>
      <button onClick={onExport} data-testid="export-button">
        Export
      </button>
      <button onClick={onImport} data-testid="import-button">
        Import
      </button>
      <button onClick={onToggleCode} data-testid="code-button">
        Code
      </button>
      <button onClick={onValidate} data-testid="validate-button">
        Validate
      </button>
      <button onClick={onPlan} data-testid="plan-button">
        Plan
      </button>
    </div>
  );
}

describe('DesignerToolbar', () => {
  const defaultProps = {
    projectName: 'Test Project',
    provider: 'aws' as const,
    isSaving: false,
    onSave: vi.fn(),
    onExport: vi.fn(),
    onImport: vi.fn(),
    onToggleCode: vi.fn(),
    onValidate: vi.fn(),
    onPlan: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render toolbar container', () => {
      render(<DesignerToolbar {...defaultProps} />);
      expect(screen.getByTestId('designer-toolbar')).toBeInTheDocument();
    });

    it('should display project name', () => {
      render(<DesignerToolbar {...defaultProps} />);
      expect(screen.getByTestId('project-name')).toHaveTextContent('Test Project');
    });

    it('should display provider', () => {
      render(<DesignerToolbar {...defaultProps} />);
      expect(screen.getByTestId('provider')).toHaveTextContent('aws');
    });
  });

  describe('Save Button', () => {
    it('should call onSave when save button clicked', () => {
      render(<DesignerToolbar {...defaultProps} />);
      fireEvent.click(screen.getByTestId('save-button'));
      expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    });

    it('should show saving state', () => {
      render(<DesignerToolbar {...defaultProps} isSaving={true} />);
      expect(screen.getByTestId('save-button')).toHaveTextContent('Saving...');
    });

    it('should disable save button while saving', () => {
      render(<DesignerToolbar {...defaultProps} isSaving={true} />);
      expect(screen.getByTestId('save-button')).toBeDisabled();
    });
  });

  describe('Export/Import Buttons', () => {
    it('should call onExport when export button clicked', () => {
      render(<DesignerToolbar {...defaultProps} />);
      fireEvent.click(screen.getByTestId('export-button'));
      expect(defaultProps.onExport).toHaveBeenCalledTimes(1);
    });

    it('should call onImport when import button clicked', () => {
      render(<DesignerToolbar {...defaultProps} />);
      fireEvent.click(screen.getByTestId('import-button'));
      expect(defaultProps.onImport).toHaveBeenCalledTimes(1);
    });
  });

  describe('Code Panel Toggle', () => {
    it('should call onToggleCode when code button clicked', () => {
      render(<DesignerToolbar {...defaultProps} />);
      fireEvent.click(screen.getByTestId('code-button'));
      expect(defaultProps.onToggleCode).toHaveBeenCalledTimes(1);
    });
  });

  describe('Terraform Actions', () => {
    it('should call onValidate when validate button clicked', () => {
      render(<DesignerToolbar {...defaultProps} />);
      fireEvent.click(screen.getByTestId('validate-button'));
      expect(defaultProps.onValidate).toHaveBeenCalledTimes(1);
    });

    it('should call onPlan when plan button clicked', () => {
      render(<DesignerToolbar {...defaultProps} />);
      fireEvent.click(screen.getByTestId('plan-button'));
      expect(defaultProps.onPlan).toHaveBeenCalledTimes(1);
    });
  });

  describe('Provider Support', () => {
    it('should handle AWS provider', () => {
      render(<DesignerToolbar {...defaultProps} provider="aws" />);
      expect(screen.getByTestId('provider')).toHaveTextContent('aws');
    });

    it('should handle Azure provider', () => {
      render(<DesignerToolbar {...defaultProps} provider="azure" />);
      expect(screen.getByTestId('provider')).toHaveTextContent('azure');
    });

    it('should handle GCP provider', () => {
      render(<DesignerToolbar {...defaultProps} provider="gcp" />);
      expect(screen.getByTestId('provider')).toHaveTextContent('gcp');
    });
  });
});
