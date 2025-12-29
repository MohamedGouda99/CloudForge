import { useState, useEffect } from 'react';
import { useThemeStore } from '../../lib/store/themeStore';
import {
  Book,
  Code,
  Layers,
  Cloud,
  Terminal,
  Shield,
  DollarSign,
  GitBranch,
  Users,
  Zap,
  ChevronRight,
  ChevronDown,
  Search,
  ExternalLink,
  Copy,
  Check,
  Sun,
  Moon,
  Home,
  FileCode,
  Server,
  Database,
  Lock,
  Key,
  Play,
  Settings,
  HelpCircle,
  BookOpen,
  Rocket,
} from 'lucide-react';

// Code block component with copy functionality
const CodeBlock = ({ code, language = 'bash' }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="bg-slate-900 dark:bg-slate-950 rounded-lg overflow-hidden border border-slate-700">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800 dark:bg-slate-900 border-b border-slate-700">
          <span className="text-xs text-slate-400 font-mono">{language}</span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-slate-300 font-mono whitespace-pre">{code}</code>
        </pre>
      </div>
    </div>
  );
};

// Collapsible section component
const CollapsibleSection = ({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-cyan-500" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 bg-white dark:bg-slate-900/30 border-t border-gray-200 dark:border-slate-800">
          {children}
        </div>
      )}
    </div>
  );
};

// Navigation item
const NavItem = ({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all ${
      active
        ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-l-2 border-cyan-500'
        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/50'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

// API endpoint component
const ApiEndpoint = ({
  method,
  path,
  description,
  requestBody,
  responseExample,
}: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requestBody?: string;
  responseExample?: string;
}) => {
  const methodColors = {
    GET: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
    POST: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    PUT: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    DELETE: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
  };

  return (
    <div className="border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden mb-4">
      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-900/50">
        <span className={`px-2 py-1 rounded text-xs font-bold border ${methodColors[method]}`}>
          {method}
        </span>
        <code className="text-sm font-mono text-gray-900 dark:text-white">{path}</code>
      </div>
      <div className="p-4 space-y-4">
        <p className="text-gray-600 dark:text-slate-400 text-sm">{description}</p>
        {requestBody && (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase mb-2">Request Body</p>
            <CodeBlock code={requestBody} language="json" />
          </div>
        )}
        {responseExample && (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase mb-2">Response</p>
            <CodeBlock code={responseExample} language="json" />
          </div>
        )}
      </div>
    </div>
  );
};

export default function DocumentationPage() {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    setIsLoaded(true);
  }, []);

  const sections = [
    { id: 'getting-started', label: 'Getting Started', icon: Rocket },
    { id: 'designer', label: 'Visual Designer', icon: Layers },
    { id: 'terraform', label: 'Terraform Generation', icon: FileCode },
    { id: 'projects', label: 'Managing Projects', icon: Cloud },
    { id: 'security', label: 'Security Scanning', icon: Shield },
    { id: 'cost', label: 'Cost Estimation', icon: DollarSign },
    { id: 'api-auth', label: 'API: Authentication', icon: Lock },
    { id: 'api-projects', label: 'API: Projects', icon: Server },
    { id: 'api-terraform', label: 'API: Terraform', icon: Terminal },
    { id: 'api-resources', label: 'API: Resources', icon: Database },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Getting Started with CloudForge</h2>
              <p className="text-gray-600 dark:text-slate-400 mb-6">
                CloudForge is Vodafone's enterprise Infrastructure as Code (IaC) platform that enables teams to visually design,
                generate, and manage cloud infrastructure using Terraform.
              </p>
            </div>

            <CollapsibleSection title="Quick Start Guide" icon={Play} defaultOpen>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Create a New Project</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                      Click "New Project" from the dashboard. Choose your cloud provider (AWS, Azure, or GCP) and give your project a name.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Design Your Infrastructure</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                      Use the visual designer to drag and drop cloud resources onto the canvas. Connect resources to define relationships.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Generate Terraform Code</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                      Click "Generate Terraform" to automatically create production-ready Terraform code from your design.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Review & Deploy</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                      Review the generated code, run security scans, estimate costs, and deploy to your cloud environment.
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Supported Cloud Providers" icon={Cloud}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
                  <img src="/cloud_logos/aws.png" alt="AWS" className="h-8 mb-3" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Amazon Web Services</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">EC2, S3, RDS, Lambda, VPC, and more</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
                  <img src="/cloud_logos/azure.png" alt="Azure" className="h-8 mb-3" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Microsoft Azure</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">VMs, Storage, SQL, Functions, VNet, and more</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
                  <img src="/cloud_logos/gcp.png" alt="GCP" className="h-8 mb-3" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Google Cloud Platform</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Compute Engine, Cloud Storage, Cloud SQL, and more</p>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        );

      case 'designer':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Visual Designer</h2>
              <p className="text-gray-600 dark:text-slate-400 mb-6">
                The Visual Designer is a drag-and-drop interface for designing cloud infrastructure. Create complex architectures
                without writing any code.
              </p>
            </div>

            <CollapsibleSection title="Using the Canvas" icon={Layers} defaultOpen>
              <div className="space-y-4 text-sm text-gray-600 dark:text-slate-400">
                <p><strong className="text-gray-900 dark:text-white">Drag & Drop:</strong> Select resources from the palette on the left and drag them onto the canvas.</p>
                <p><strong className="text-gray-900 dark:text-white">Connect Resources:</strong> Click and drag from one resource's handle to another to create connections.</p>
                <p><strong className="text-gray-900 dark:text-white">Configure Properties:</strong> Click on any resource to open the properties panel and configure settings.</p>
                <p><strong className="text-gray-900 dark:text-white">Zoom & Pan:</strong> Use mouse wheel to zoom, click and drag on empty space to pan.</p>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Keyboard Shortcuts" icon={Terminal}>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-slate-800/50 rounded">
                  <span className="text-gray-600 dark:text-slate-400">Delete selected</span>
                  <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-xs">Delete</kbd>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-slate-800/50 rounded">
                  <span className="text-gray-600 dark:text-slate-400">Undo</span>
                  <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-xs">Ctrl+Z</kbd>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-slate-800/50 rounded">
                  <span className="text-gray-600 dark:text-slate-400">Redo</span>
                  <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-xs">Ctrl+Y</kbd>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-slate-800/50 rounded">
                  <span className="text-gray-600 dark:text-slate-400">Select all</span>
                  <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-xs">Ctrl+A</kbd>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-slate-800/50 rounded">
                  <span className="text-gray-600 dark:text-slate-400">Save</span>
                  <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-xs">Ctrl+S</kbd>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-slate-800/50 rounded">
                  <span className="text-gray-600 dark:text-slate-400">Fit view</span>
                  <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-xs">F</kbd>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        );

      case 'terraform':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Terraform Generation</h2>
              <p className="text-gray-600 dark:text-slate-400 mb-6">
                CloudForge automatically generates production-ready Terraform code from your visual designs.
              </p>
            </div>

            <CollapsibleSection title="Generated Code Structure" icon={FileCode} defaultOpen>
              <CodeBlock
                language="text"
                code={`project/
├── main.tf          # Main resource definitions
├── variables.tf     # Input variables
├── outputs.tf       # Output values
├── providers.tf     # Provider configuration
└── terraform.tfvars # Variable values`}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Example: AWS EC2 Instance" icon={Server}>
              <CodeBlock
                language="hcl"
                code={`resource "aws_instance" "web_server" {
  ami           = var.ami_id
  instance_type = "t3.micro"

  vpc_security_group_ids = [aws_security_group.web.id]
  subnet_id              = aws_subnet.public.id

  tags = {
    Name        = "web-server"
    Environment = var.environment
    ManagedBy   = "CloudForge"
  }
}`}
              />
            </CollapsibleSection>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Managing Projects</h2>
              <p className="text-gray-600 dark:text-slate-400 mb-6">
                Projects are the core organizational unit in CloudForge. Each project contains a single infrastructure design.
              </p>
            </div>

            <CollapsibleSection title="Project Actions" icon={Settings} defaultOpen>
              <div className="space-y-3 text-sm text-gray-600 dark:text-slate-400">
                <p><strong className="text-gray-900 dark:text-white">Duplicate:</strong> Create a copy of an existing project with all resources.</p>
                <p><strong className="text-gray-900 dark:text-white">Export:</strong> Download project as JSON for backup or sharing.</p>
                <p><strong className="text-gray-900 dark:text-white">Share:</strong> Generate a shareable link to the project.</p>
                <p><strong className="text-gray-900 dark:text-white">Delete:</strong> Permanently remove a project and all its data.</p>
              </div>
            </CollapsibleSection>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Security Scanning</h2>
              <p className="text-gray-600 dark:text-slate-400 mb-6">
                CloudForge integrates with TFSec and Terrascan to scan your infrastructure for security vulnerabilities.
              </p>
            </div>

            <CollapsibleSection title="Security Checks" icon={Shield} defaultOpen>
              <div className="space-y-3 text-sm text-gray-600 dark:text-slate-400">
                <p><strong className="text-gray-900 dark:text-white">Encryption:</strong> Ensures data is encrypted at rest and in transit.</p>
                <p><strong className="text-gray-900 dark:text-white">Access Control:</strong> Validates IAM policies and security groups.</p>
                <p><strong className="text-gray-900 dark:text-white">Network Security:</strong> Checks for open ports and public exposure.</p>
                <p><strong className="text-gray-900 dark:text-white">Compliance:</strong> Validates against CIS benchmarks and best practices.</p>
              </div>
            </CollapsibleSection>
          </div>
        );

      case 'cost':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cost Estimation</h2>
              <p className="text-gray-600 dark:text-slate-400 mb-6">
                Get real-time cost estimates for your infrastructure using Infracost integration.
              </p>
            </div>

            <CollapsibleSection title="How It Works" icon={DollarSign} defaultOpen>
              <div className="space-y-3 text-sm text-gray-600 dark:text-slate-400">
                <p>CloudForge calculates estimated monthly costs based on:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Resource types and configurations</li>
                  <li>Regional pricing differences</li>
                  <li>Usage patterns and reservations</li>
                  <li>Data transfer estimates</li>
                </ul>
              </div>
            </CollapsibleSection>
          </div>
        );

      case 'api-auth':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">API: Authentication</h2>
              <p className="text-gray-600 dark:text-slate-400 mb-6">
                CloudForge uses JWT tokens for API authentication. All API requests require a valid Bearer token.
              </p>
            </div>

            <ApiEndpoint
              method="POST"
              path="/api/auth/login"
              description="Authenticate and receive an access token"
              requestBody={`{
  "username": "your-username",
  "password": "your-password"
}`}
              responseExample={`{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}`}
            />

            <ApiEndpoint
              method="GET"
              path="/api/auth/me"
              description="Get current user information. Requires Bearer token."
              responseExample={`{
  "id": 1,
  "username": "admin",
  "email": "admin@vodafone.com",
  "created_at": "2025-01-01T00:00:00Z"
}`}
            />

            <CollapsibleSection title="Using the Token" icon={Key} defaultOpen>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                Include the token in the Authorization header for all authenticated requests:
              </p>
              <CodeBlock
                language="bash"
                code={`curl -X GET "http://localhost:8000/api/projects/" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`}
              />
            </CollapsibleSection>
          </div>
        );

      case 'api-projects':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">API: Projects</h2>
              <p className="text-gray-600 dark:text-slate-400 mb-6">
                Manage infrastructure projects via the REST API.
              </p>
            </div>

            <ApiEndpoint
              method="GET"
              path="/api/projects/"
              description="List all projects for the authenticated user"
              responseExample={`[
  {
    "id": 1,
    "name": "Production Infrastructure",
    "cloud_provider": "aws",
    "description": "Main production environment",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
]`}
            />

            <ApiEndpoint
              method="POST"
              path="/api/projects/"
              description="Create a new project"
              requestBody={`{
  "name": "My New Project",
  "cloud_provider": "aws",
  "description": "Project description"
}`}
              responseExample={`{
  "id": 2,
  "name": "My New Project",
  "cloud_provider": "aws",
  "description": "Project description",
  "created_at": "2025-01-20T12:00:00Z"
}`}
            />

            <ApiEndpoint
              method="GET"
              path="/api/projects/{project_id}"
              description="Get a specific project with diagram data"
              responseExample={`{
  "id": 1,
  "name": "Production Infrastructure",
  "cloud_provider": "aws",
  "diagram_data": {
    "nodes": [...],
    "edges": [...]
  }
}`}
            />

            <ApiEndpoint
              method="PUT"
              path="/api/projects/{project_id}"
              description="Update a project"
              requestBody={`{
  "name": "Updated Name",
  "description": "Updated description",
  "diagram_data": { ... }
}`}
            />

            <ApiEndpoint
              method="DELETE"
              path="/api/projects/{project_id}"
              description="Delete a project"
            />
          </div>
        );

      case 'api-terraform':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">API: Terraform</h2>
              <p className="text-gray-600 dark:text-slate-400 mb-6">
                Generate and manage Terraform code for your projects.
              </p>
            </div>

            <ApiEndpoint
              method="POST"
              path="/api/terraform/generate/{project_id}"
              description="Generate Terraform code from project diagram"
              responseExample={`{
  "success": true,
  "terraform_code": "resource \\"aws_instance\\" ...",
  "files": {
    "main.tf": "...",
    "variables.tf": "...",
    "outputs.tf": "..."
  }
}`}
            />

            <ApiEndpoint
              method="GET"
              path="/api/terraform/download/{project_id}"
              description="Download generated Terraform as a ZIP file"
            />
          </div>
        );

      case 'api-resources':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">API: Resources</h2>
              <p className="text-gray-600 dark:text-slate-400 mb-6">
                Get information about available cloud resources and their schemas.
              </p>
            </div>

            <ApiEndpoint
              method="GET"
              path="/api/resources/catalog/{provider}"
              description="Get resource catalog for a cloud provider (aws, azure, gcp)"
              responseExample={`{
  "provider": "aws",
  "categories": [
    {
      "name": "Compute",
      "resources": [
        {
          "type": "aws_instance",
          "name": "EC2 Instance",
          "icon": "server",
          "description": "Virtual server in AWS"
        }
      ]
    }
  ]
}`}
            />

            <ApiEndpoint
              method="GET"
              path="/api/resources/schema/{resource_type}"
              description="Get configuration schema for a specific resource type"
              responseExample={`{
  "type": "aws_instance",
  "properties": {
    "instance_type": {
      "type": "string",
      "default": "t3.micro",
      "options": ["t3.micro", "t3.small", "t3.medium"]
    },
    "ami": {
      "type": "string",
      "required": true
    }
  }
}`}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="flex items-center gap-3 group">
                <div className="bg-white rounded-xl p-2 shadow-md border border-gray-100 dark:border-transparent">
                  <img src="/vodafone.png" alt="Vodafone" className="h-8 w-auto" />
                </div>
                <div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">CloudForge</span>
                  <span className="text-xs text-gray-500 dark:text-slate-500 block">Documentation</span>
                </div>
              </a>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-all"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Back to app */}
              <a
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to App
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              <div className="mb-4">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                  User Guide
                </h3>
              </div>
              {sections.slice(0, 6).map((section) => (
                <NavItem
                  key={section.id}
                  icon={section.icon}
                  label={section.label}
                  active={activeSection === section.id}
                  onClick={() => setActiveSection(section.id)}
                />
              ))}

              <div className="my-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                  API Reference
                </h3>
              </div>
              {sections.slice(6).map((section) => (
                <NavItem
                  key={section.id}
                  icon={section.icon}
                  label={section.label}
                  active={activeSection === section.id}
                  onClick={() => setActiveSection(section.id)}
                />
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main
            className={`flex-1 min-w-0 transition-all duration-500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-gray-200 dark:border-slate-800 p-8">
              {renderContent()}
            </div>

            {/* Help card */}
            <div className="mt-8 bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Need more help?</h3>
                  <p className="text-white/80 text-sm mb-4">
                    Our support team is available 24/7 to assist with any questions.
                  </p>
                  <a
                    href="mailto:support@vodafone.com"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg font-medium text-sm hover:bg-white/90 transition-colors"
                  >
                    Contact Support
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
