import { useState, useRef, useEffect, useCallback } from 'react';
import {
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
  Brain,
  Zap,
} from 'lucide-react';
import apiClient from '../lib/api/client';
import { useAuthStore } from '../lib/store/authStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIInspectorPanelProps {
  provider: string;
  currentCanvas?: {
    nodes: any[];
    edges: any[];
  };
  onImportResources?: (resources: any[], connections: any[]) => void;
}

const QUICK_PROMPTS = [
  { text: 'Create a VPC with subnets', icon: '🌐' },
  { text: 'Add load balanced web servers', icon: '⚡' },
  { text: 'Set up a secure database', icon: '🔒' },
  { text: 'Design serverless API', icon: '🚀' },
];

const MODELS = [
  { id: 'claude-sonnet-4-20250514', name: 'Sonnet 4', badge: 'Fast' },
  { id: 'claude-opus-4-20250514', name: 'Opus 4', badge: 'Smart' },
];

export default function AIInspectorPanel({
  provider,
  currentCanvas,
  onImportResources,
}: AIInspectorPanelProps) {
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 px-3 py-2 border-b border-gray-800 bg-gradient-to-r from-red-900/30 via-gray-900 to-red-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-white">AI Assistant</span>
                <Sparkles className="w-3 h-3 text-red-400" />
              </div>
              <p className="text-[10px] text-gray-500 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-red-500" />
                <span className="uppercase text-red-400 font-medium">{provider}</span>
              </p>
            </div>
          </div>

          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex items-center gap-1.5 px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 transition-colors"
            >
              <span>{MODELS.find((m) => m.id === model)?.name}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showModelDropdown && (
              <div className="absolute right-0 top-full mt-1 w-36 py-1 bg-gray-800 border border-gray-700 rounded shadow-xl z-20">
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setModel(m.id);
                      setShowModelDropdown(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs transition-colors ${
                      model === m.id ? 'bg-red-600/20 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{m.name}</span>
                      <span className={`text-[9px] px-1 py-0.5 rounded ${
                        m.badge === 'Fast' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                      }`}>
                        {m.badge}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-2">
            {/* Hero */}
            <div className="relative mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
                <Bot className="w-7 h-7 text-white" />
              </div>
            </div>

            <h3 className="text-sm font-bold text-white mb-1">
              How can I help?
            </h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Design infrastructure, suggest resources, or troubleshoot issues.
            </p>

            {/* Quick Prompts */}
            <div className="w-full space-y-1.5">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(prompt.text)}
                  className="w-full px-3 py-2 text-left bg-gray-800/60 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg border border-gray-700/50 hover:border-red-500/30 transition-all text-xs"
                >
                  <span className="mr-2">{prompt.icon}</span>
                  {prompt.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {msg.role === 'user' ? (
                    <div className="w-7 h-7 rounded-md bg-gray-700 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-300" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-md bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`group relative max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-red-600 text-white rounded-xl rounded-tr-sm'
                      : 'bg-gray-800 text-gray-100 rounded-xl rounded-tl-sm border border-gray-700'
                  } px-3 py-2 shadow-sm`}
                >
                  <div className="text-xs whitespace-pre-wrap break-words leading-relaxed">{msg.content}</div>

                  {/* Actions */}
                  <div className={`absolute -bottom-2 ${msg.role === 'user' ? 'left-1' : 'right-1'} flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="p-1 bg-gray-900 border border-gray-700 rounded shadow hover:bg-gray-800 transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-2.5 h-2.5 text-green-400" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 text-gray-400" />
                      )}
                    </button>

                    {msg.role === 'assistant' && msg.content.includes('"resources"') && onImportResources && (
                      <button
                        onClick={() => tryImportResources(msg.content)}
                        className="px-1.5 py-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-medium rounded shadow transition-colors flex items-center gap-0.5"
                      >
                        <Wand2 className="w-2.5 h-2.5" />
                        Import
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-800 rounded-xl rounded-tl-sm px-3 py-2 border border-gray-700">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-red-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[10px] text-gray-500">Thinking...</span>
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
        <div className="mx-3 mb-2 px-2 py-1.5 bg-red-900/30 border border-red-500/30 rounded flex items-center gap-1.5 text-[10px] text-red-400">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 p-3 border-t border-gray-800 bg-gray-900/80">
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="w-full mb-2 py-1 text-[10px] text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded transition-colors"
          >
            Clear conversation
          </button>
        )}
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about architecture..."
            rows={2}
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 text-white placeholder:text-gray-600 text-xs"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-3 bg-red-600 hover:bg-red-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="mt-1.5 text-[9px] text-gray-600 text-center">
          Press <kbd className="px-1 bg-gray-800 rounded text-gray-500">Enter</kbd> to send
        </p>
      </div>
    </div>
  );
}
