'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Navbar } from '@/components/layout/Navbar'
import { Shield, Key, Bell, Trash2, CheckCircle2, User, Code2 } from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [saved, setSaved] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [autoExpand, setAutoExpand] = useState(false)
  const [theme, setTheme] = useState('dark')

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const clearHistory = () => {
    if (confirm('Clear all scan history? This cannot be undone.')) {
      localStorage.removeItem('devaudit_history')
      alert('History cleared.')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Manage your DevAudit preferences</p>
        </div>

        {/* Profile */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
            <User className="w-4 h-4 text-red-400" />
            <h2 className="font-semibold text-white">Profile</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-lg">
              {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-semibold text-white">{session?.user?.name || 'Anonymous'}</p>
              <p className="text-sm text-[var(--text-muted)]">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* API */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
            <Key className="w-4 h-4 text-red-400" />
            <h2 className="font-semibold text-white">Gemini API Key</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            The API key is configured via the <code className="font-mono text-red-400 bg-red-500/10 px-1 rounded">GOOGLE_GEMINI_API_KEY</code> environment variable on the server. You don't need to enter it here.
          </p>
          <div className="bg-[var(--bg-hover)] rounded-lg p-3 text-xs font-mono text-[var(--text-muted)]">
            <p># .env.local</p>
            <p className="text-green-400">GOOGLE_GEMINI_API_KEY=your-key...</p>
          </div>
        </div>

        {/* Scanner preferences */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
            <Code2 className="w-4 h-4 text-red-400" />
            <h2 className="font-semibold text-white">Scanner Preferences</h2>
          </div>

          <div className="space-y-3">
            <Toggle label="Auto-expand vulnerabilities" description="Automatically expand all vulnerability details after scan" value={autoExpand} onChange={setAutoExpand} />
            <Toggle label="Scan notifications" description="Show a notification when scan completes" value={notifications} onChange={setNotifications} />
          </div>

          <button onClick={save} className="btn-primary text-sm">
            {saved ? <><CheckCircle2 className="w-4 h-4" />Saved!</> : 'Save preferences'}
          </button>
        </div>

        {/* Danger zone */}
        <div className="card p-5 space-y-4 border-red-500/20">
          <div className="flex items-center gap-2 pb-3 border-b border-red-500/10">
            <Shield className="w-4 h-4 text-red-500" />
            <h2 className="font-semibold text-red-400">Danger Zone</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Clear scan history</p>
              <p className="text-xs text-[var(--text-muted)]">Permanently delete all local scan history</p>
            </div>
            <button onClick={clearHistory} className="btn-secondary text-sm text-red-400 hover:text-red-300 border-red-500/20">
              <Trash2 className="w-4 h-4" /> Clear
            </button>
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-[var(--text-muted)] font-mono">DevAudit v2.0.0 · Powered by Pranav Jasyal</p>
      </main>
    </div>
  )
}

function Toggle({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-[var(--text-muted)]">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative ${value ? 'bg-red-500' : 'bg-[var(--bg-hover)] border border-[var(--border)]'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  )
}
