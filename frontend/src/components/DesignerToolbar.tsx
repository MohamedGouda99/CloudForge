import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Download,
  Code,
  CheckCircle,
  Play,
  Rocket,
  Trash2,
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  ChevronLeft,
  Loader2,
  Circle,
  User,
  Home,
  ChevronRight,
  Key,
  Shield,
  DollarSign,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Undo2,
  Redo2,
  Grid3X3,
  Image,
  FileText,
  History,
  Eye,
  Minus,
  LayoutGrid,
} from 'lucide-react';
import { CloudProvider } from '../lib/resources';
import CloudIcon from './CloudIcon';

interface DesignerToolbarProps {
  projectName: string;
  projectDescription?: string;
  provider: CloudProvider;
  hasUnsavedChanges?: boolean;
  isSaving: boolean;
  hasCredentials?: boolean;
  showCode?: boolean;
  showMinimap?: boolean;
  showAssistant?: boolean;
  terraformAction?: string | null;
  zoom?: number;
  onSave: () => void;
  onCredentials?: () => void;
  onExport: () => void;
  onImport: () => void;
  onDownload?: () => void;
  onToggleSidebar?: () => void;
  onToggleCode: () => void;
  onToggleMinimap: () => void;
  onToggleAssistant?: () => void;
  onValidate: () => void;
  onPlan: () => void;
  onApply: () => void;
  onDestroy: () => void;
  onTfsec?: () => void;
  onTerrascan?: () => void;
  onInfracost?: () => void;
  onOpenAssistant?: () => void;
  onOpenSettings?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onDelete?: () => void;
  onBack?: () => void;
  sidebarOpen?: boolean;
  codePanelOpen?: boolean;
  minimapOpen?: boolean;
  terraformLoading?: 'validate' | 'plan' | 'apply' | 'destroy' | null;
  userName?: string;
  onNavigateHome?: () => void;
  // New props for enhanced toolbar
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  gridType?: 'dots' | 'lines' | 'none';
  onGridTypeChange?: (type: 'dots' | 'lines' | 'none') => void;
  showNodeTitles?: boolean;
  showConnectors?: boolean;
  showConnectorLabels?: boolean;
  animateConnectorLine?: boolean;
  animateConnectorCircles?: boolean;
  onToggleNodeTitles?: () => void;
  onToggleConnectors?: () => void;
  onToggleConnectorLabels?: () => void;
  onToggleAnimateConnectorLine?: () => void;
  onToggleAnimateConnectorCircles?: () => void;
  onExportImage?: () => void;
  onExportPdf?: () => void;
  onShowHistory?: () => void;
  readme?: string;
  onReadmeChange?: (readme: string) => void;
}

interface TooltipProps {
  content: string;
  shortcut?: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

function Tooltip({ content, shortcut, children, position = 'bottom' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = useCallback(() => {
    timeoutRef.current = setTimeout(() => setVisible(true), 400);
  }, []);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {visible && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 z-50 px-2.5 py-1.5 text-xs font-medium
            bg-foreground text-background rounded-md shadow-lg whitespace-nowrap
            pointer-events-none animate-in fade-in-0 zoom-in-95 duration-150
            ${position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'}`}
        >
          <div className="flex items-center gap-2">
            <span>{content}</span>
            {shortcut && (
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted-foreground/20 rounded">
                {shortcut}
              </kbd>
            )}
          </div>
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45
              ${position === 'bottom' ? '-top-1' : '-bottom-1'}`}
          />
        </div>
      )}
    </div>
  );
}

// Toggle Switch Component
interface ToggleSwitchProps {
  enabled: boolean;
  onChange: () => void;
  label: string;
}

function ToggleSwitch({ enabled, onChange, label }: ToggleSwitchProps) {
  return (
    <button
      onClick={onChange}
      className="w-full px-3 py-2 flex items-center justify-between text-sm text-left
        text-foreground hover:bg-secondary/60 transition-all duration-150"
    >
      <span className="font-medium">{label}</span>
      <div
        className={`relative w-9 h-5 rounded-full transition-colors duration-200
          ${enabled ? 'bg-primary' : 'bg-muted'}`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
            ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`}
        />
      </div>
    </button>
  );
}

// Dropdown Menu Component
interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  closeOnClick?: boolean;
}

function DropdownMenu({ trigger, children, align = 'left', closeOnClick = true }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={`absolute top-full mt-2 z-50 min-w-[200px] py-1
            bg-background/95 backdrop-blur-xl rounded-lg shadow-2xl border border-border/50
            animate-in fade-in-0 slide-in-from-top-2 zoom-in-95 duration-200
            ${align === 'right' ? 'right-0' : 'left-0'}`}
          onClick={closeOnClick ? () => setOpen(false) : undefined}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// Markdown Editor Toolbar Button
interface EditorToolbarButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  title?: string;
}

function EditorToolbarButton({ icon, onClick, title }: EditorToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="h-8 w-8 inline-flex items-center justify-center rounded
        text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
        hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      {icon}
    </button>
  );
}

// Simple markdown to HTML converter for preview
function parseMarkdown(text: string): string {
  if (!text) return '';

  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^######\s+(.*)$/gm, '<h6 class="text-sm font-semibold mt-4 mb-2">$1</h6>')
    .replace(/^#####\s+(.*)$/gm, '<h5 class="text-sm font-semibold mt-4 mb-2">$1</h5>')
    .replace(/^####\s+(.*)$/gm, '<h4 class="text-base font-semibold mt-4 mb-2">$1</h4>')
    .replace(/^###\s+(.*)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^##\s+(.*)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^#\s+(.*)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-4 border-gray-200 dark:border-gray-700" />')
    // Unordered lists
    .replace(/^\s*[-*]\s+(.*)$/gm, '<li class="ml-4">$1</li>')
    // Ordered lists
    .replace(/^\s*\d+\.\s+(.*)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Blockquotes
    .replace(/^>\s+(.*)$/gm, '<blockquote class="pl-4 border-l-4 border-gray-300 dark:border-gray-600 italic text-gray-600 dark:text-gray-400">$1</blockquote>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/\n/g, '<br />');

  return `<p class="mb-3">${html}</p>`;
}

// Readme Modal Component
interface ReadmeModalProps {
  isOpen: boolean;
  onClose: () => void;
  readme: string;
  onChange: (value: string) => void;
}

function ReadmeModal({ isOpen, onClose, readme, onChange }: ReadmeModalProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = readme.substring(start, end) || placeholder;
    const newText = readme.substring(0, start) + before + selectedText + after + readme.substring(end);

    onChange(newText);

    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      if (selectedText === placeholder) {
        // Select the placeholder text so user can type over it
        textarea.setSelectionRange(start + before.length, start + before.length + placeholder.length);
      } else {
        const newCursorPos = start + before.length + selectedText.length + after.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [readme, onChange]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          insertText('**', '**', 'bold');
          break;
        case 'i':
          e.preventDefault();
          insertText('*', '*', 'italic');
          break;
        case 'k':
          e.preventDefault();
          insertText('[', '](url)', 'link text');
          break;
        case 'e':
          e.preventDefault();
          insertText('`', '`', 'code');
          break;
      }
    }
  }, [insertText]);

  if (!isOpen) return null;

  const toolbarButtons = [
    // Text formatting
    { icon: <span className="font-bold text-base">B</span>, action: () => insertText('**', '**', 'bold'), title: 'Bold (Ctrl+B)' },
    { icon: <span className="italic text-base">I</span>, action: () => insertText('*', '*', 'italic'), title: 'Italic (Ctrl+I)' },
    { icon: <span className="line-through text-base">S</span>, action: () => insertText('~~', '~~', 'strikethrough'), title: 'Strikethrough' },
    { icon: <span className="text-sm font-bold tracking-tight">HR</span>, action: () => insertText('\n---\n', '', ''), title: 'Horizontal Rule' },
    { icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16" /><path d="M4 12h10" /><path d="M4 18h6" /></svg>, action: () => insertText('## ', '', 'Heading'), title: 'Heading' },
    { divider: true },
    // Links and quotes
    { icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>, action: () => insertText('[', '](url)', 'link text'), title: 'Link (Ctrl+K)' },
    { icon: <span className="text-lg font-serif leading-none">"</span>, action: () => insertText('> ', '', 'quote'), title: 'Block Quote' },
    { divider: true },
    // Code
    { icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>, action: () => insertText('`', '`', 'code'), title: 'Inline Code' },
    { icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" /></svg>, action: () => insertText('\n```\n', '\n```\n', 'code block'), title: 'Code Block' },
    // Media
    { icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>, action: () => insertText('![', '](image-url)', 'alt text'), title: 'Image' },
    { icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /><path d="M15 3v18" /></svg>, action: () => insertText('\n| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Cell 1 | Cell 2 | Cell 3 |\n', '', ''), title: 'Table' },
    { divider: true },
    // Lists
    { icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" /><circle cx="5" cy="6" r="1.5" fill="currentColor" /><circle cx="5" cy="12" r="1.5" fill="currentColor" /><circle cx="5" cy="18" r="1.5" fill="currentColor" /></svg>, action: () => insertText('- ', '', 'list item'), title: 'Bullet List' },
    { icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><text x="3" y="8" fontSize="9" fontWeight="bold" fill="currentColor">1.</text><text x="3" y="14" fontSize="9" fontWeight="bold" fill="currentColor">2.</text><text x="3" y="20" fontSize="9" fontWeight="bold" fill="currentColor">3.</text></svg>, action: () => insertText('1. ', '', 'list item'), title: 'Numbered List' },
    { icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="4" height="4" rx="1" /><line x1="10" y1="7" x2="21" y2="7" /><rect x="3" y="15" width="4" height="4" rx="1" /><line x1="10" y1="17" x2="21" y2="17" /><path d="M5 7h0" /><path d="M5 17h0" /></svg>, action: () => insertText('- [ ] ', '', 'task item'), title: 'Task List' },
    { divider: true },
    // Help
    { icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><circle cx="12" cy="17" r="0.5" fill="currentColor" /></svg>, action: () => window.open('https://www.markdownguide.org/basic-syntax/', '_blank'), title: 'Markdown Help' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Readme.md</h2>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg
                text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800
                transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            The readme file of the current architecture. It will be pushed into your repo when you create a pull request.
          </p>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              {toolbarButtons.map((btn, idx) =>
                'divider' in btn ? (
                  <div key={idx} className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-2" />
                ) : (
                  <EditorToolbarButton
                    key={idx}
                    icon={btn.icon}
                    onClick={btn.action}
                    title={btn.title}
                  />
                )
              )}
            </div>

            {/* Edit/Preview Toggle */}
            <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-0.5">
              <button
                onClick={() => setMode('edit')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5
                  ${mode === 'edit'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => setMode('preview')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5
                  ${mode === 'preview'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {mode === 'edit' ? (
            <textarea
              ref={textareaRef}
              value={readme}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write your architecture documentation in markdown...

# Getting Started
Write documentation for your infrastructure architecture.

## Shortcuts
- Ctrl+B: Bold
- Ctrl+I: Italic
- Ctrl+K: Link
- Ctrl+E: Inline code"
              className="w-full h-full min-h-[400px] p-6 text-sm font-mono bg-white dark:bg-gray-900
                text-gray-900 dark:text-gray-100 resize-none focus:outline-none
                placeholder:text-gray-400 dark:placeholder:text-gray-600"
              spellCheck={false}
            />
          ) : (
            <div
              className="w-full min-h-[400px] p-6 prose prose-sm dark:prose-invert max-w-none
                text-gray-900 dark:text-gray-100"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(readme) || '<p class="text-gray-400 italic">Nothing to preview</p>' }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
              bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg
              hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg
              hover:bg-primary/90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// Toolbar Button Component
interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}

function ToolbarButton({ icon, label, shortcut, onClick, disabled, active }: ToolbarButtonProps) {
  return (
    <Tooltip content={label} shortcut={shortcut}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`h-8 w-8 inline-flex items-center justify-center rounded-lg
          transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed
          ${active
            ? 'bg-primary/20 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
          }`}
      >
        {icon}
      </button>
    </Tooltip>
  );
}

// Toolbar Divider
function ToolbarDivider() {
  return <div className="w-px h-6 bg-border/50 mx-1" />;
}

const providerColors: Record<CloudProvider, string> = {
  aws: 'bg-gradient-to-r from-orange-500/15 to-amber-500/15 text-orange-600 border-orange-500/40 dark:text-orange-400',
  azure: 'bg-gradient-to-r from-blue-500/15 to-cyan-500/15 text-blue-600 border-blue-500/40 dark:text-blue-400',
  gcp: 'bg-gradient-to-r from-red-500/15 to-yellow-500/15 text-red-600 border-red-500/40 dark:text-red-400',
};

const providerShortNames: Record<CloudProvider, string> = {
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'GCP',
};

export default function DesignerToolbar({
  projectName,
  provider,
  hasUnsavedChanges,
  isSaving: _isSaving,
  hasCredentials,
  onSave: _onSave,
  onCredentials,
  onExport,
  onImport: _onImport,
  onToggleSidebar: _onToggleSidebar,
  onToggleCode: _onToggleCode,
  onToggleMinimap: _onToggleMinimap,
  onValidate,
  onPlan,
  onApply,
  onDestroy,
  onTfsec,
  onTerrascan,
  onInfracost,
  onOpenAssistant,
  onOpenSettings,
  sidebarOpen: _sidebarOpen,
  codePanelOpen: _codePanelOpen,
  minimapOpen: _minimapOpen = true,
  zoom = 100,
  onZoomIn,
  onZoomOut,
  onFitView,
  terraformLoading = null,
  userName,
  onNavigateHome,
  // New props with defaults
  onUndo,
  onRedo,
  canUndo = true,
  canRedo = true,
  gridType = 'dots',
  onGridTypeChange,
  showNodeTitles = true,
  showConnectors = true,
  showConnectorLabels = true,
  animateConnectorLine = false,
  animateConnectorCircles = false,
  onToggleNodeTitles,
  onToggleConnectors,
  onToggleConnectorLabels,
  onToggleAnimateConnectorLine,
  onToggleAnimateConnectorCircles,
  onExportImage,
  onExportPdf,
  onShowHistory,
  readme = '',
  onReadmeChange,
}: DesignerToolbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [readmeModalOpen, setReadmeModalOpen] = useState(false);
  const [localReadme, setLocalReadme] = useState(readme);
  const [terraformExpanded, setTerraformExpanded] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Local state for display options (used when props aren't controlled)
  const [localGridType, setLocalGridType] = useState<'dots' | 'lines' | 'none'>(gridType);
  const [localShowNodeTitles, setLocalShowNodeTitles] = useState(showNodeTitles);
  const [localShowConnectors, setLocalShowConnectors] = useState(showConnectors);
  const [localShowConnectorLabels, setLocalShowConnectorLabels] = useState(showConnectorLabels);
  const [localAnimateConnectorLine, setLocalAnimateConnectorLine] = useState(animateConnectorLine);
  const [localAnimateConnectorCircles, setLocalAnimateConnectorCircles] = useState(animateConnectorCircles);

  // Determine effective values (use props if controlled, otherwise local state)
  const effectiveGridType = onGridTypeChange ? gridType : localGridType;
  const effectiveShowNodeTitles = onToggleNodeTitles ? showNodeTitles : localShowNodeTitles;
  const effectiveShowConnectors = onToggleConnectors ? showConnectors : localShowConnectors;
  const effectiveShowConnectorLabels = onToggleConnectorLabels ? showConnectorLabels : localShowConnectorLabels;
  const effectiveAnimateConnectorLine = onToggleAnimateConnectorLine ? animateConnectorLine : localAnimateConnectorLine;
  const effectiveAnimateConnectorCircles = onToggleAnimateConnectorCircles ? animateConnectorCircles : localAnimateConnectorCircles;

  // Handlers that use props if available, otherwise local state
  const handleGridTypeChange = (type: 'dots' | 'lines' | 'none') => {
    if (onGridTypeChange) {
      onGridTypeChange(type);
    } else {
      setLocalGridType(type);
    }
  };

  const handleToggleNodeTitles = () => {
    if (onToggleNodeTitles) {
      onToggleNodeTitles();
    } else {
      setLocalShowNodeTitles(v => !v);
    }
  };

  const handleToggleConnectors = () => {
    if (onToggleConnectors) {
      onToggleConnectors();
    } else {
      setLocalShowConnectors(v => !v);
    }
  };

  const handleToggleConnectorLabels = () => {
    if (onToggleConnectorLabels) {
      onToggleConnectorLabels();
    } else {
      setLocalShowConnectorLabels(v => !v);
    }
  };

  const handleToggleAnimateConnectorLine = () => {
    if (onToggleAnimateConnectorLine) {
      onToggleAnimateConnectorLine();
    } else {
      setLocalAnimateConnectorLine(v => !v);
    }
  };

  const handleToggleAnimateConnectorCircles = () => {
    if (onToggleAnimateConnectorCircles) {
      onToggleAnimateConnectorCircles();
    } else {
      setLocalAnimateConnectorCircles(v => !v);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReadmeClose = () => {
    onReadmeChange?.(localReadme);
    setReadmeModalOpen(false);
  };

  return (
    <>
      <div className="glass-panel h-14 px-4 flex items-center justify-between gap-4 rounded-xl border border-border/40 shadow-lg">
        {/* Left Section: Navigation & Project Info */}
        <div className="flex items-center gap-3 min-w-0">
          {onNavigateHome && (
            <Tooltip content="Back to Projects" position="bottom">
              <button
                onClick={onNavigateHome}
                className="h-9 w-9 inline-flex items-center justify-center rounded-xl
                  text-muted-foreground hover:text-foreground hover:bg-secondary/80
                  border border-transparent hover:border-border/40
                  transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Home className="h-4 w-4" />
              </button>
            </Tooltip>
          )}

          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <span className="hidden sm:inline">Projects</span>
              <ChevronRight className="h-3.5 w-3.5 hidden sm:inline" />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="font-bold text-foreground truncate max-w-[120px] lg:max-w-[180px]">
                {projectName}
              </h1>
              {hasUnsavedChanges && (
                <Tooltip content="Unsaved changes" position="bottom">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Circle className="h-2 w-2 fill-current animate-pulse" />
                  </div>
                </Tooltip>
              )}
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-2
              transition-all duration-200 hover:scale-105
              ${providerColors[provider]}`}
          >
            <CloudIcon icon={provider} size={14} />
            <span className="hidden sm:inline">{providerShortNames[provider]}</span>
          </div>
        </div>

        {/* Center Section: Canvas Tools */}
        <div className="flex items-center gap-1">
          {/* Zoom Controls */}
          <ToolbarButton
            icon={<ZoomIn className="h-4 w-4" />}
            label="Zoom In"
            shortcut="Ctrl++"
            onClick={onZoomIn}
          />
          <ToolbarButton
            icon={<Maximize2 className="h-4 w-4" />}
            label="Fit to Screen"
            shortcut="Ctrl+0"
            onClick={onFitView}
          />
          <ToolbarButton
            icon={<ZoomOut className="h-4 w-4" />}
            label="Zoom Out"
            shortcut="Ctrl+-"
            onClick={onZoomOut}
          />

          <ToolbarDivider />

          {/* Undo/Redo */}
          <ToolbarButton
            icon={<Undo2 className="h-4 w-4" />}
            label="Undo"
            shortcut="Ctrl+Z"
            onClick={onUndo}
            disabled={!canUndo}
          />
          <ToolbarButton
            icon={<Redo2 className="h-4 w-4" />}
            label="Redo"
            shortcut="Ctrl+Y"
            onClick={onRedo}
            disabled={!canRedo}
          />

          <ToolbarDivider />

          {/* Export Dropdown */}
          <DropdownMenu
            trigger={
              <Tooltip content="Export">
                <button className="h-8 px-2.5 inline-flex items-center gap-1 rounded-lg
                  text-muted-foreground hover:text-foreground hover:bg-secondary/80
                  transition-all duration-150">
                  <Download className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3" />
                </button>
              </Tooltip>
            }
          >
            <button
              onClick={onExportImage || onExport}
              className="w-full px-3 py-2 flex items-center gap-3 text-sm text-left
                text-foreground hover:bg-secondary/60 transition-all duration-150"
            >
              <Image className="h-4 w-4 text-muted-foreground" />
              <span>Export as image</span>
            </button>
            <button
              onClick={onExportPdf || onExport}
              className="w-full px-3 py-2 flex items-center gap-3 text-sm text-left
                text-foreground hover:bg-secondary/60 transition-all duration-150"
            >
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>Export as PDF</span>
            </button>
          </DropdownMenu>

          {/* History Button */}
          <ToolbarButton
            icon={<History className="h-4 w-4" />}
            label="History"
            onClick={onShowHistory}
          />

          <ToolbarDivider />

          {/* Grid View Options Dropdown */}
          <DropdownMenu
            trigger={
              <Tooltip content="Grid Options">
                <button className="h-8 px-2.5 inline-flex items-center gap-1 rounded-lg
                  text-muted-foreground hover:text-foreground hover:bg-secondary/80
                  transition-all duration-150">
                  <Grid3X3 className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3" />
                </button>
              </Tooltip>
            }
          >
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Grid Style
            </div>
            <button
              onClick={() => handleGridTypeChange('dots')}
              className={`w-full px-3 py-2 flex items-center gap-3 text-sm text-left
                transition-all duration-150
                ${effectiveGridType === 'dots' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary/60'}`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Dots</span>
              {effectiveGridType === 'dots' && <CheckCircle className="h-3.5 w-3.5 ml-auto" />}
            </button>
            <button
              onClick={() => handleGridTypeChange('lines')}
              className={`w-full px-3 py-2 flex items-center gap-3 text-sm text-left
                transition-all duration-150
                ${effectiveGridType === 'lines' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary/60'}`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span>Lines</span>
              {effectiveGridType === 'lines' && <CheckCircle className="h-3.5 w-3.5 ml-auto" />}
            </button>
            <button
              onClick={() => handleGridTypeChange('none')}
              className={`w-full px-3 py-2 flex items-center gap-3 text-sm text-left
                transition-all duration-150
                ${effectiveGridType === 'none' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary/60'}`}
            >
              <Minus className="h-4 w-4" />
              <span>Hide</span>
              {effectiveGridType === 'none' && <CheckCircle className="h-3.5 w-3.5 ml-auto" />}
            </button>
          </DropdownMenu>

          {/* Nodes View Options Dropdown */}
          <DropdownMenu
            trigger={
              <Tooltip content="Node Options">
                <button className="h-8 px-2.5 inline-flex items-center gap-1 rounded-lg
                  text-muted-foreground hover:text-foreground hover:bg-secondary/80
                  transition-all duration-150">
                  <Eye className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3" />
                </button>
              </Tooltip>
            }
            closeOnClick={false}
          >
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Node Display
            </div>
            <ToggleSwitch
              enabled={effectiveShowNodeTitles}
              onChange={handleToggleNodeTitles}
              label="Show titles"
            />
            <ToggleSwitch
              enabled={effectiveShowConnectors}
              onChange={handleToggleConnectors}
              label="Show connectors"
            />
            <ToggleSwitch
              enabled={effectiveShowConnectorLabels}
              onChange={handleToggleConnectorLabels}
              label="Show connector labels"
            />
            <div className="my-1 border-t border-border/30" />
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Animations
            </div>
            <ToggleSwitch
              enabled={effectiveAnimateConnectorLine}
              onChange={handleToggleAnimateConnectorLine}
              label="Animate connector line"
            />
            <ToggleSwitch
              enabled={effectiveAnimateConnectorCircles}
              onChange={handleToggleAnimateConnectorCircles}
              label="Animate connector circles"
            />
          </DropdownMenu>

          {/* Readme Button */}
          <ToolbarButton
            icon={<FileText className="h-4 w-4" />}
            label="Readme"
            onClick={() => setReadmeModalOpen(true)}
          />
        </div>

        {/* Right Section: Actions & User */}
        <div className="flex items-center gap-2">
          {/* Zoom Display */}
          <div className="bg-secondary/60 rounded-lg px-2.5 py-1.5 border border-border/40">
            <span className="text-xs font-semibold text-foreground tabular-nums">{Math.round(zoom)}%</span>
          </div>

          <ToolbarDivider />

          {/* Collapsible Terraform Actions */}
          <div className="flex items-center">
            {/* Animated Action Buttons Container */}
            <div
              className={`flex items-center gap-1.5 overflow-hidden transition-all duration-300 ease-out ${
                terraformExpanded ? 'max-w-[400px] opacity-100 mr-2' : 'max-w-0 opacity-0'
              }`}
            >
              {/* Plan Button */}
              <button
                onClick={onPlan}
                disabled={terraformLoading === 'plan'}
                className={`h-8 px-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold
                  whitespace-nowrap transition-all duration-200 transform
                  ${terraformExpanded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                  bg-[#714EFF] text-white hover:bg-[#5f3ee6] shadow-md shadow-[#714EFF]/25
                  disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{ transitionDelay: terraformExpanded ? '50ms' : '0ms' }}
              >
                {terraformLoading === 'plan' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                Plan
              </button>

              {/* Validate Button */}
              <button
                onClick={onValidate}
                disabled={terraformLoading === 'validate'}
                className={`h-8 px-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold
                  whitespace-nowrap transition-all duration-200 transform
                  ${terraformExpanded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                  bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm
                  dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700
                  disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{ transitionDelay: terraformExpanded ? '100ms' : '0ms' }}
              >
                {terraformLoading === 'validate' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="h-3.5 w-3.5" />
                )}
                Validate
              </button>

              {/* Apply Button */}
              <button
                onClick={onApply}
                disabled={terraformLoading === 'apply'}
                className={`h-8 px-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold
                  whitespace-nowrap transition-all duration-200 transform
                  ${terraformExpanded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                  bg-[#714EFF] text-white hover:bg-[#5f3ee6] shadow-md shadow-[#714EFF]/25
                  disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{ transitionDelay: terraformExpanded ? '150ms' : '0ms' }}
              >
                {terraformLoading === 'apply' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Rocket className="h-3.5 w-3.5" />
                )}
                Apply
              </button>

              {/* Destroy Button */}
              <button
                onClick={onDestroy}
                disabled={terraformLoading === 'destroy'}
                className={`h-8 px-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold
                  whitespace-nowrap transition-all duration-200 transform
                  ${terraformExpanded ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                  bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 shadow-md shadow-red-500/25
                  disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{ transitionDelay: terraformExpanded ? '200ms' : '0ms' }}
              >
                {terraformLoading === 'destroy' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Destroy
              </button>
            </div>

            {/* Toggle Arrow Button */}
            <Tooltip content={terraformExpanded ? "Hide Actions" : "Terraform Actions"}>
              <button
                onClick={() => setTerraformExpanded(!terraformExpanded)}
                className={`h-9 px-3 inline-flex items-center gap-2 rounded-xl
                  transition-all duration-300 ease-out
                  ${terraformExpanded
                    ? 'bg-[#714EFF] text-white shadow-lg shadow-[#714EFF]/30'
                    : 'bg-[#714EFF] text-white shadow-md shadow-[#714EFF]/25 hover:shadow-lg hover:shadow-[#714EFF]/30'
                  }
                  hover:scale-105 active:scale-95`}
              >
                <Code className="h-4 w-4" />
                <span className="text-xs font-semibold hidden lg:inline">Terraform</span>
                <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${terraformExpanded ? 'rotate-180' : ''}`} />
              </button>
            </Tooltip>
          </div>

          {/* Security Dropdown */}
          <DropdownMenu
            trigger={
              <Tooltip content="Security & Cost">
                <button className="h-9 w-9 inline-flex items-center justify-center rounded-xl
                  bg-amber-500/15 text-amber-600 border border-amber-500/40
                  hover:bg-amber-500/25 transition-all duration-200
                  dark:text-amber-400">
                  <Shield className="h-4 w-4" />
                </button>
              </Tooltip>
            }
            align="right"
          >
            <button
              onClick={onTfsec}
              className="w-full px-3 py-2.5 flex items-center gap-3 text-sm text-left
                text-foreground hover:bg-secondary/60 transition-all duration-150"
            >
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              <div>
                <span className="block font-medium">TFSec Scan</span>
                <span className="text-[10px] text-muted-foreground">Security analysis</span>
              </div>
            </button>
            <button
              onClick={onTerrascan}
              className="w-full px-3 py-2.5 flex items-center gap-3 text-sm text-left
                text-foreground hover:bg-secondary/60 transition-all duration-150"
            >
              <ShieldAlert className="h-4 w-4 text-orange-500" />
              <div>
                <span className="block font-medium">Terrascan</span>
                <span className="text-[10px] text-muted-foreground">Policy violations</span>
              </div>
            </button>
            <div className="my-1 border-t border-border/30" />
            <button
              onClick={onInfracost}
              className="w-full px-3 py-2.5 flex items-center gap-3 text-sm text-left
                text-foreground hover:bg-secondary/60 transition-all duration-150"
            >
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <span className="block font-medium">Infracost</span>
                <span className="text-[10px] text-muted-foreground">Cost estimation</span>
              </div>
            </button>
          </DropdownMenu>

          {/* Credentials */}
          <Tooltip content={hasCredentials ? "Credentials Configured" : "Set Cloud Credentials"}>
            <button
              onClick={onCredentials || (() => {})}
              className={`h-9 w-9 inline-flex items-center justify-center rounded-xl
                transition-all duration-200 hover:scale-105 active:scale-95
                ${hasCredentials
                  ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/40 dark:text-emerald-400'
                  : 'bg-amber-500/15 text-amber-600 border border-amber-500/40 dark:text-amber-400 animate-pulse'}`}
            >
              <Key className="h-4 w-4" />
            </button>
          </Tooltip>

          {/* AI Assistant */}
          <Tooltip content="AI Assistant">
            <button
              onClick={onOpenAssistant || (() => {})}
              className="h-9 px-3 inline-flex items-center gap-2 rounded-xl text-sm font-medium
                transition-all duration-200 hover:scale-105 active:scale-95
                bg-gradient-to-r from-red-500/15 to-red-600/15 text-red-600 border border-red-500/40
                hover:from-red-500/25 hover:to-red-600/25 hover:shadow-lg hover:shadow-red-500/20
                dark:text-red-400"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden lg:inline font-medium">AI</span>
            </button>
          </Tooltip>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`h-9 w-9 inline-flex items-center justify-center rounded-xl
                bg-gradient-to-br from-primary/20 to-primary/10 text-primary border border-primary/40
                hover:from-primary/30 hover:to-primary/20 hover:shadow-lg hover:shadow-primary/20 hover:scale-105
                active:scale-95 transition-all duration-200
                ${userMenuOpen ? 'from-primary/30 to-primary/20 shadow-lg shadow-primary/20 scale-105' : ''}`}
            >
              <User className="h-4 w-4" />
            </button>

            {userMenuOpen && (
              <div className="absolute top-full right-0 mt-2 z-50 min-w-[180px] py-2
                bg-background/95 backdrop-blur-xl rounded-xl shadow-2xl border border-border/50
                animate-in fade-in-0 slide-in-from-top-2 zoom-in-95 duration-200">
                {userName && (
                  <div className="px-4 py-2.5 border-b border-border/50">
                    <p className="text-sm font-semibold text-foreground">{userName}</p>
                    <p className="text-[10px] text-muted-foreground">Logged in</p>
                  </div>
                )}
                <button
                  onClick={() => {
                    onOpenSettings?.();
                    setUserMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-left
                    text-foreground hover:bg-primary/10 hover:text-primary hover:pl-5 transition-all duration-150"
                >
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">Settings</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Readme Modal */}
      <ReadmeModal
        isOpen={readmeModalOpen}
        onClose={handleReadmeClose}
        readme={localReadme}
        onChange={setLocalReadme}
      />
    </>
  );
}
