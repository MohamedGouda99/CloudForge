import { useMemo, useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Wand2,
  Copy,
  CheckCircle2,
  Rocket,
  ShieldCheck,
  Code2,
  Globe2,
  Cloud,
} from 'lucide-react';
import apiClient from '../../lib/api/client';
import { useAuthStore } from '../../lib/store/authStore';
import { toast } from '../../components/Toast';

type Provider = 'aws' | 'azure' | 'gcp';

const PROVIDER_BADGES: Record<Provider, string> = {
  aws: '/api/icons/AWS/aws.png',
  azure: '/api/icons/Azure/azure.png',
  gcp: '/api/icons/GCP/gcp.png',
};
type Model =
  | 'gemini-2.0-flash'
  | 'gemini-2.0-pro'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-pro';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const quickPrompts = [
  'Design a production-ready VPC with three AZ subnets and NAT gateways',
  'Add an ALB with HTTPS listeners and forward to the web tier',
  'Create an RDS PostgreSQL instance with Multi-AZ and backups enabled',
  'Harden security groups for web + database tiers with least privilege',
];

const modelBadges: Record<Model, string> = {
  'gemini-2.0-flash': 'Low latency · Fast drafts',
  'gemini-2.0-pro': 'Balanced · General purpose',
  'gemini-2.5-flash': 'Latest · High speed',
  'gemini-2.5-pro': 'Latest · Highest quality',
};

export default function AssistantPage() {
  const token = useAuthStore((s) => s.token);
  const [prompt, setPrompt] = useState(quickPrompts[0]);
  const [provider, setProvider] = useState<Provider>('aws');
  const [model, setModel] = useState<Model>('gemini-2.0-flash');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const providerBadge = useMemo(() => PROVIDER_BADGES[provider], [provider]);

  const generate = async () => {
    setError('');
    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: prompt }]);
    try {
      const res = await apiClient.post(
        '/api/assistant/terraform',
        { prompt, provider, model },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      const tf = res.data.code || '';
      setCode(tf);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Terraform generated.' }]);
    } catch (e: any) {
      const d = e?.response?.data;
      const detail = typeof d === 'string' ? d : d?.detail || e.message;
      setError(detail);
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${detail}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    toast.success('Copied', 'Terraform copied to clipboard');
  };

  const handlePromptInsert = (text: string) => {
    setPrompt(text);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      <div className="absolute inset-0 opacity-50 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(230,0,0,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.12),transparent_30%)]" />

      <div className="relative max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Hero */}
        <div className="rounded-3xl bg-white/80 dark:bg-gray-900/70 border border-red-100 dark:border-red-900/30 shadow-xl p-8 backdrop-blur">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-sm text-red-700 dark:text-red-300">
                <Sparkles className="w-4 h-4" />
                Vodafone AI Design Copilot
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                Generate production-grade Terraform in seconds
              </h1>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
                Guided prompts, Vodafone guardrails, and Brainboard-inspired interactions for AWS, Azure, and GCP. Ship secure landing zones and application stacks without leaving the canvas.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Guardrails & linting
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                  <Code2 className="w-4 h-4 text-red-500" /> Terraform 1.6 ready
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                  <Globe2 className="w-4 h-4 text-blue-500" /> Multi-cloud aware
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-red-600 text-white rounded-2xl p-4 shadow-2xl">
              <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
                <Cloud className="w-8 h-8" />
              </div>
              <div>
                <div className="text-sm uppercase tracking-wide text-white/80">Current provider</div>
                <div className="text-xl font-bold">Vodafone Multi-Cloud</div>
                <div className="text-white/80 text-sm">Brainboard-grade UX</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt composer */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                  <Wand2 className="w-4 h-4 text-red-600" />
                  Compose prompt
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{modelBadges[model]}</span>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value as Model)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    <option value="gemini-2.0-pro">Gemini 2.0 Pro</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  </select>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow shadow-sm"
                  placeholder="Describe the infrastructure you want to build..."
                />

                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((qp) => (
                    <button
                      key={qp}
                      onClick={() => handlePromptInsert(qp)}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      {qp}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="w-7 h-7 rounded-lg bg-white dark:bg-white p-1 ring-2 ring-red-100 dark:ring-red-500/30 flex items-center justify-center">
                      <img src={providerBadge} alt={`${provider} logo`} className="w-full h-full object-contain" />
                    </div>
                    <div className="text-xs uppercase text-gray-600 dark:text-gray-300">{provider}</div>
                  </div>
                  <div className="flex gap-2">
                    {(['aws', 'azure', 'gcp'] as Provider[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setProvider(p)}
                        className={`px-3 py-2 rounded-lg border text-sm capitalize transition-all ${
                          provider === p
                            ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/30'
                            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={generate}
                    disabled={loading}
                    className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {loading ? 'Generating...' : 'Generate Terraform'}
                  </button>
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <ShieldCheck className="w-4 h-4 mt-0.5" />
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Output */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                  <Code2 className="w-4 h-4 text-red-600" />
                  Terraform (main.tf)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <pre className="bg-gray-50 dark:bg-black/60 text-sm text-gray-900 dark:text-gray-100 p-5 max-h-[420px] overflow-auto whitespace-pre-wrap leading-relaxed">
                {code || '# Output will appear here'}
              </pre>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                <Rocket className="w-4 h-4 text-red-600" />
                Session stream
              </div>
              <div className="space-y-3 max-h-[280px] overflow-auto pr-1">
                {messages.length === 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Your conversation history will appear here.
                  </div>
                )}
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-900 dark:text-red-100'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide mb-1">
                      <span className="font-bold">{m.role === 'user' ? 'You' : 'Assistant'}</span>
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    {m.content}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                Vodafone guardrails
              </div>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> Security lenses for SG/NSG baselines
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> Cost-aware instance sizing hints
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> Naming & tagging aligned to Vodafone standards
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
