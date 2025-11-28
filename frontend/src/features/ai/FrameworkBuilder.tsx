import { useState } from 'react'
import axios from 'axios'

export default function FrameworkBuilder() {
  const [guide, setGuide] = useState('')
  const [provider, setProvider] = useState('')
  const [taskId, setTaskId] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const startBuild = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await axios.post('/api/ai/frameworks/build', {
        guide_text: guide,
        cloud_provider: provider || null,
      })
      setTaskId(res.data.task_id)
      poll(res.data.task_id)
    } catch (e: any) {
      setResult({ error: e?.response?.data?.detail || e.message })
    } finally {
      setLoading(false)
    }
  }

  const poll = async (id: string) => {
    let tries = 0
    const max = 60
    while (tries < max) {
      tries++
      const r = await axios.get(`/api/ai/tasks/${id}`)
      if (r.data.state === 'SUCCESS' || r.data.state === 'FAILURE') {
        setResult(r.data.result)
        break
      }
      await new Promise((res) => setTimeout(res, 2000))
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">AI Framework Builder (Gemini)</h2>
      <div className="space-y-4">
        <textarea
          className="w-full h-48 p-3 border rounded bg-background text-foreground"
          placeholder="Paste user guide or requirements here"
          value={guide}
          onChange={(e) => setGuide(e.target.value)}
        />
        <div className="flex gap-2">
          <input
            className="p-2 border rounded bg-background text-foreground"
            placeholder="Cloud provider (aws|azure|gcp, optional)"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          />
          <button
            onClick={startBuild}
            disabled={loading || !guide.trim()}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          >
            {loading ? 'Building…' : 'Build Framework'}
          </button>
        </div>
        {taskId && (
          <div className="text-sm text-muted-foreground">Task: {taskId}</div>
        )}
        {result && (
          <pre className="bg-card p-3 rounded border overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
