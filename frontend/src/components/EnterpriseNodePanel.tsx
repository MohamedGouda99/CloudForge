import { useState } from 'react';
import { Node } from 'reactflow';
import {
  X,
  Settings2,
  Link2,
  Code2,
  Shield,
  DollarSign,
  Info,
  Save,
  Trash2,
  Copy,
  Eye,
  ChevronRight,
} from 'lucide-react';
import CloudIcon from './CloudIcon';

interface EnterpriseNodePanelProps {
  node: Node | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: any) => void;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
}

export default function EnterpriseNodePanel({
  node,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
}: EnterpriseNodePanelProps) {
  const [activeTab, setActiveTab] = useState<'properties' | 'security' | 'cost'>('properties');
  const [config, setConfig] = useState(node?.data?.config || {});

  if (!node) return null;

  const tabs = [
    { id: 'properties', label: 'Properties', icon: Settings2 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'cost', label: 'Cost', icon: DollarSign },
  ];

  return (
    <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-white dark:from-red-900/10 dark:to-gray-800">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 
                          flex items-center justify-center shadow-inner border border-gray-300 dark:border-gray-600">
              <CloudIcon icon={node.data?.icon} size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                {node.data?.displayName || 'Resource'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {node.data?.resourceType || node.type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDuplicate?.(node.id)}
            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                     rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Duplicate
          </button>
          <button
            onClick={() => onDelete?.(node.id)}
            className="flex-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 
                     text-red-600 dark:text-red-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all relative
                       ${activeTab === tab.id 
                         ? 'text-red-600 dark:text-red-400' 
                         : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                       }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {activeTab === 'properties' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={node.data?.displayName || ''}
                onChange={(e) => onUpdate(node.id, { ...node.data, displayName: e.target.value })}
                className="input-vodafone"
                placeholder="Resource name"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 dark:text-blue-200">
                  <p className="font-semibold mb-1">Configuration</p>
                  <p>Double-click the resource on canvas to configure all properties</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Resource Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{node.data?.resourceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="text-gray-900 dark:text-white capitalize">{node.data?.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Node ID:</span>
                  <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{node.id}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-green-900 dark:text-green-200 mb-1">Security Scan: Passed</p>
                  <p className="text-green-700 dark:text-green-300">No security issues detected</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Compliance</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                  <span className="text-sm text-gray-700 dark:text-gray-300">GDPR Compliant</span>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                  <span className="text-sm text-gray-700 dark:text-gray-300">ISO 27001</span>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                  <span className="text-sm text-gray-700 dark:text-gray-300">SOC 2 Type II</span>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Encryption</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-red-600 rounded" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Encryption at rest</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-red-600 rounded" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Encryption in transit</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cost' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 
                          border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Estimated Monthly Cost</span>
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-200">$0.00</p>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Based on 730 hours/month</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Cost Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                  <span className="text-gray-600 dark:text-gray-400">Compute</span>
                  <span className="font-semibold text-gray-900 dark:text-white">$0.00</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                  <span className="text-gray-600 dark:text-gray-400">Storage</span>
                  <span className="font-semibold text-gray-900 dark:text-white">$0.00</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                  <span className="text-gray-600 dark:text-gray-400">Network</span>
                  <span className="font-semibold text-gray-900 dark:text-white">$0.00</span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-orange-900 dark:text-orange-200">
                  <p className="font-semibold mb-1">Cost Optimization</p>
                  <p>Configure resource to see detailed cost estimates powered by Infracost</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2 mb-3">
          <button className="flex-1 btn-vodafone py-2 text-sm">
            <Save className="w-4 h-4 mr-2 inline" />
            Apply Changes
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <img src="/vodafone.png" alt="Vodafone" className="h-3 w-auto" />
          <span>Enterprise Security</span>
        </div>
      </div>
    </div>
  );
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

