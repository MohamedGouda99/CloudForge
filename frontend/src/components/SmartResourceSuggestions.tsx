import { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { Sparkles, X, Plus, TrendingUp, Zap } from 'lucide-react';
import CloudIcon from './CloudIcon';
import { CloudResource } from '../lib/resources';

interface SmartResourceSuggestionsProps {
  nodes: Node[];
  provider: string;
  onAddResource: (resource: CloudResource) => void;
}

interface Suggestion {
  resource: CloudResource;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export default function SmartResourceSuggestions({
  nodes,
  provider,
  onAddResource,
}: SmartResourceSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // AI-powered smart suggestions based on current architecture
    const newSuggestions: Suggestion[] = [];
    
    const hasVPC = nodes.some(n => n.data?.resourceType?.includes('vpc') || n.data?.resourceType?.includes('virtual_network'));
    const hasEC2 = nodes.some(n => n.data?.resourceType?.includes('instance') || n.data?.resourceType?.includes('virtual_machine'));
    const hasDB = nodes.some(n => n.data?.resourceType?.includes('db_') || n.data?.resourceType?.includes('sql') || n.data?.resourceType?.includes('rds'));
    const hasLoadBalancer = nodes.some(n => n.data?.resourceType?.includes('lb') || n.data?.resourceType?.includes('load_balancer'));
    const hasS3 = nodes.some(n => n.data?.resourceType?.includes('s3') || n.data?.resourceType?.includes('storage_bucket'));

    // Smart suggestions logic
    if (nodes.length === 0) {
      newSuggestions.push({
        resource: {
          type: provider === 'aws' ? 'aws_vpc' : provider === 'azure' ? 'azurerm_virtual_network' : 'google_compute_network',
          label: 'VPC',
          description: 'Start with a Virtual Private Cloud',
          icon: '/api/icons/aws/Arch_Networking-Content-Delivery/64/Arch_Amazon-Virtual-Private-Cloud_64.svg',
          category: 'networking',
        },
        reason: 'Best practice: Start with network isolation',
        priority: 'high',
        category: 'networking',
      });
    }

    if (hasVPC && !hasEC2 && provider === 'aws') {
      newSuggestions.push({
        resource: {
          type: 'aws_instance',
          label: 'EC2 Instance',
          description: 'Add compute capacity',
          icon: '/api/icons/aws/Arch_Compute/64/Arch_Amazon-EC2_64.svg',
          category: 'compute',
        },
        reason: 'Common next step: Add compute resources',
        priority: 'high',
        category: 'compute',
      });
    }

    if (hasEC2 && !hasDB && provider === 'aws') {
      newSuggestions.push({
        resource: {
          type: 'aws_db_instance',
          label: 'RDS Database',
          description: 'Managed relational database',
          icon: '/api/icons/aws/Arch_Database/64/Arch_Amazon-RDS_64.svg',
          category: 'database',
        },
        reason: 'Most applications need a database',
        priority: 'medium',
        category: 'database',
      });
    }

    if (hasEC2 && !hasLoadBalancer && provider === 'aws') {
      newSuggestions.push({
        resource: {
          type: 'aws_lb',
          label: 'Application Load Balancer',
          description: 'Distribute traffic',
          icon: '/api/icons/aws/Arch_Networking-Content-Delivery/64/Arch_Elastic-Load-Balancing_64.svg',
          category: 'networking',
        },
        reason: 'High availability: Add load balancing',
        priority: 'medium',
        category: 'networking',
      });
    }

    if (hasEC2 && !hasS3 && provider === 'aws') {
      newSuggestions.push({
        resource: {
          type: 'aws_s3_bucket',
          label: 'S3 Bucket',
          description: 'Object storage for assets',
          icon: '/api/icons/aws/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg',
          category: 'storage',
        },
        reason: 'Store static assets, backups, and logs',
        priority: 'low',
        category: 'storage',
      });
    }

    setSuggestions(newSuggestions);
  }, [nodes, provider]);

  if (!show || suggestions.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-purple-500 dark:border-purple-600 z-50 animate-in slide-in-from-right">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-t-xl">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold text-lg">AI Suggestions</h3>
          </div>
          <button onClick={() => setShow(false)} className="hover:bg-white/20 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-purple-100 text-sm mt-1">Powered by Vodafone AI</p>
      </div>

      {/* Suggestions */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {suggestions.map((suggestion, index) => {
          const priorityColors = {
            high: 'border-red-300 bg-red-50 dark:bg-red-900/10',
            medium: 'border-orange-300 bg-orange-50 dark:bg-orange-900/10',
            low: 'border-blue-300 bg-blue-50 dark:bg-blue-900/10',
          };

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${priorityColors[suggestion.priority]} hover:shadow-lg transition-all cursor-pointer group`}
              onClick={() => onAddResource(suggestion.resource)}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <CloudIcon icon={suggestion.resource.icon} size={24} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 dark:text-white">{suggestion.resource.label}</h4>
                    <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-semibold uppercase">
                      {suggestion.priority}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {suggestion.reason}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-500">{suggestion.resource.type}</span>
                  </div>
                </div>

                <button className="opacity-0 group-hover:opacity-100 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {suggestions.length === 0 && (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <Zap className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No suggestions yet</p>
            <p className="text-xs">Add resources to get AI-powered recommendations</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Smart recommendations</span>
          </div>
          <div className="flex items-center gap-1">
            <img src="/vodafone.png" alt="Vodafone" className="h-3 w-auto" />
            <span>AI Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}

