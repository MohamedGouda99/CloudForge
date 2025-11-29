import { useState } from 'react';
import apiClient from '../../lib/api/client';
import { useAuthStore } from '../../lib/store/authStore';

export default function AssistantPage() {
  const token = useAuthStore((s) => s.token);
  const [prompt, setPrompt] = useState('Create a VPC with two subnets and an EC2 instance');
  const [provider, setProvider] = useState('aws');
  const [model, setModel] = useState('gemini-2.0-flash');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post('/api/assistant/terraform', { prompt, provider, model }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setCode(res.data.code || '');
    } catch (e: any) {
      const d = e?.response?.data;
      setError(typeof d === 'string' ? d : d?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Smart Assistant (Gemini)</h1>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm text-muted-foreground">Prompt</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} className="w-full px-3 py-2 bg-background border border-input rounded" />
        </div>
        <div className="flex gap-3">
          <div className="grid gap-2">
            <label className="text-sm text-muted-foreground">Provider</label>
            <select value={provider} onChange={(e) => setProvider(e.target.value)} className="px-3 py-2 bg-background border border-input rounded">
              <option value="aws">AWS</option>
              <option value="azure">Azure</option>
              <option value="gcp">GCP</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-muted-foreground">Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)} className="px-3 py-2 bg-background border border-input rounded">
              <option value="gemini-2.0-flash">gemini-2.0-flash</option>
              <option value="gemini-2.0-pro">gemini-2.0-pro</option>
              <option value="gemini-2.5-flash">gemini-2.5-flash</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro</option>
            </select>
          </div>
          <div className="flex-1 flex items-end">
            <button onClick={generate} disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50">
              {loading ? 'Generating...' : 'Generate Terraform'}
            </button>
          </div>
        </div>
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded p-2">{error}</div>
        )}
        <div className="grid gap-2">
          <label className="text-sm text-muted-foreground">Output (main.tf)</label>
          <pre className="bg-background border border-input rounded p-3 overflow-auto max-h-[460px] whitespace-pre-wrap">{code || '# Output will appear here'}</pre>
        </div>
      </div>
    </div>
  );
}
