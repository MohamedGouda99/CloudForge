import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Send,
  Loader2,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  ChevronDown,
  Wand2,
  AlertCircle,
  Zap,
  Brain,
  MessageSquare,
} from 'lucide-react';
import apiClient from '../lib/api/client';
import { useAuthStore } from '../lib/store/authStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: string;
  currentCanvas?: {
    nodes: any[];
    edges: any[];
  };
  onImportResources?: (resources: any[], connections: any[]) => void;
}

const QUICK_PROMPTS = [
  { text: 'Create a VPC with public and private subnets', icon: '🌐' },
  { text: 'Add a web server behind a load balancer', icon: '⚡' },
  { text: 'Set up a secure database with backups', icon: '🔒' },
  { text: 'Design a serverless API with Lambda', icon: '🚀' },
  { text: 'Add monitoring and alerting', icon: '📊' },
];

const MODELS = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'Fast & efficient', badge: 'Recommended' },
  { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', description: 'Most capable', badge: 'Premium' },
];

export default function AIAssistantModal({
  isOpen,
  onClose,
  provider,
  currentCanvas,
  onImportResources,
}: AIAssistantModalProps) {
  const token = useAuthStore((s) => s.token);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [model, setModel] = useState('claude-sonnet-4-20250514');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const response = await apiClient.post(
        '/api/assistant/chat',
        {
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model,
          canvas_context: currentCanvas
            ? {
                nodes: currentCanvas.nodes.map((n) => ({
                  id: n.id,
                  type: n.data?.resourceType || n.type,
                  label: n.data?.label || n.data?.displayName,
                })),
                edges: currentCanvas.edges.map((e) => ({
                  source: e.source,
                  target: e.target,
                })),
                provider,
              }
            : undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to get response';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, model, currentCanvas, provider, token]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
  };

  const tryImportResources = (content: string) => {
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.resources && onImportResources) {
          onImportResources(parsed.resources, parsed.connections || []);
          return true;
        }
      }
    } catch {
      // Not valid JSON
    }
    return false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Vodafone Dark Theme */}
      <div
        ref={modalRef}
        className="relative w-full max-w-3xl h-[85vh] bg-gradient-to-b from-gray-900 via-gray-900 to-black border border-red-500/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          boxShadow: '0 0 80px rgba(230, 0, 0, 0.12), 0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-600/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-red-600/8 rounded-full blur-3xl" />
        </div>

        {/* Header - Vodafone Red Accent */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gradient-to-r from-red-900/20 via-gray-900 to-red-900/20">
          <div className="flex items-center gap-4">
            {/* AI Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 rounded-xl blur-md opacity-40" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg border border-red-500/30">
                <Brain className="w-6 h-6 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                AI Assistant
                <Sparkles className="w-4 h-4 text-red-400" />
              </h2>
              <p className="text-xs text-gray-400 flex items-center gap-2">
                <Zap className="w-3 h-3 text-red-500" />
                <span>Powered by Claude</span>
                <span className="text-gray-600">|</span>
                <span className="uppercase font-semibold text-red-400">{provider}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Model Selector */}
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 rounded-lg border border-gray-700 hover:border-red-500/50 transition-all duration-200"
              >
                <Brain className="w-4 h-4 text-red-500" />
                <span className="font-medium text-sm">
                  {MODELS.find((m) => m.id === model)?.name || 'Select Model'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showModelDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showModelDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 py-1 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-10">
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setModel(m.id);
                        setShowModelDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left transition-all duration-150 ${
                        model === m.id
                          ? 'bg-red-600/20 border-l-2 border-red-500'
                          : 'hover:bg-gray-800 border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white text-sm">{m.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          m.badge === 'Recommended'
                            ? 'bg-green-600/20 text-green-400'
                            : 'bg-red-600/20 text-red-400'
                        }`}>
                          {m.badge}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{m.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Chat */}
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="relative flex-1 overflow-y-auto p-6 space-y-5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              {/* Hero Icon */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-600 rounded-2xl blur-xl opacity-25" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-xl border border-red-500/30">
                  <Bot className="w-10 h-10 text-white" />
                  <div className="absolute -bottom-1 -right-1">
                    <Sparkles className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                How can I help you build?
              </h3>
              <p className="text-sm text-gray-400 mb-6 max-w-md leading-relaxed">
                I'm your AI architecture assistant. I can help you design cloud infrastructure,
                suggest resources, explain Terraform concepts, and troubleshoot issues.
              </p>

              {/* Quick Prompts */}
              <div className="w-full max-w-xl">
                <p className="text-xs text-gray-500 mb-3 flex items-center justify-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Try one of these prompts
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickPrompt(prompt.text)}
                      className="group px-4 py-3 text-left bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg border border-gray-700/50 hover:border-red-500/40 transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{prompt.icon}</span>
                        <span className="text-sm leading-snug">{prompt.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {msg.role === 'user' ? (
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shadow-md">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-md">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`group relative max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-red-600 text-white rounded-2xl rounded-tr-sm'
                        : 'bg-gray-800 text-gray-100 rounded-2xl rounded-tl-sm border border-gray-700'
                    } px-4 py-3 shadow-md`}
                  >
                    <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</div>

                    {/* Actions */}
                    <div className={`absolute -bottom-2.5 ${msg.role === 'user' ? 'left-2' : 'right-2'} flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="p-1.5 bg-gray-900 border border-gray-700 rounded-md shadow-lg hover:bg-gray-800 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-400" />
                        )}
                      </button>

                      {msg.role === 'assistant' && msg.content.includes('"resources"') && onImportResources && (
                        <button
                          onClick={() => tryImportResources(msg.content)}
                          className="px-2 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-md shadow-lg transition-colors flex items-center gap-1"
                        >
                          <Wand2 className="w-3 h-3" />
                          Import
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-red-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-3 px-4 py-3 bg-red-900/30 border border-red-500/30 rounded-lg flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Area */}
        <div className="relative p-4 border-t border-gray-800 bg-gray-900/80">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about architecture, Terraform, or cloud best practices..."
                rows={2}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-white placeholder:text-gray-500 text-sm transition-all duration-200"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-red-600/20"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-600 text-center">
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">Enter</kbd>
            <span className="mx-1">to send</span>
            <span className="mx-2 text-gray-700">|</span>
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">Shift + Enter</kbd>
            <span className="mx-1">for new line</span>
          </p>
        </div>
      </div>
    </div>
  );
}
