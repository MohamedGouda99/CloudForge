import { useState } from 'react';
import apiClient from '../lib/api/client';

type Message = { role: 'user' | 'assistant'; text: string };

export default function AssistantChatPanel({ projectId, provider, onImport }: { projectId: number; provider: string; onImport: (diagram: any) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('Add an EC2 instance in the public subnet');
  const [model, setModel] = useState('claude-3-5-sonnet-20241022');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const send = async () => {
    if (!input.trim()) return;
    const next = [...messages, { role: 'user', text: input }];
    setMessages(next);
    setInput('');
    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post('/api/assistant/complete', { prompt: input, model });
      const text = res.data?.output || '';
      setMessages([...next, { role: 'assistant', text }]);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  const importDesign = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post(`/api/assistant/design/${projectId}`, { prompt: input || 'Create a VPC with two subnets and an EC2 instance', provider, model });
      const diagram = res.data?.diagram;
      if (diagram) onImport(diagram);
      const text = 'Design imported into canvas';
      setMessages([...messages, { role: 'assistant', text }]);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-96 flex-shrink-0 bg-card border-l border-border flex flex-col">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="font-semibold text-foreground">Assistant</div>
        <select value={model} onChange={(e) => setModel(e.target.value)} className="text-sm bg-background border border-input rounded px-2 py-1">
          <option value="claude-3-5-sonnet-20241022">claude-3-5-sonnet-20241022</option>
          <option value="claude-3-5-sonnet-20240620">claude-3-5-sonnet-20240620</option>
          <option value="claude-3-opus-20240229">claude-3-opus-20240229</option>
          <option value="claude-3-haiku-20240307">claude-3-haiku-20240307</option>
        </select>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`text-sm ${m.role === 'user' ? 'text-foreground' : 'text-muted-foreground'}`}>{m.text}</div>
        ))}
        {error && <div className="text-sm text-destructive">{error}</div>}
      </div>
      <div className="p-3 border-t border-border space-y-2">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={3} className="w-full bg-background border border-input rounded px-3 py-2" placeholder="Describe changes or ask for resources" />
        <div className="flex gap-2">
          <button onClick={send} disabled={loading} className="px-3 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50">{loading ? '...' : 'Send'}</button>
          <button onClick={importDesign} disabled={loading} className="px-3 py-2 bg-purple-600 text-white rounded disabled:opacity-50">Import to Canvas</button>
        </div>
      </div>
    </div>
  );
}
