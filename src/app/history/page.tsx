'use client'
import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { SeverityBadge } from '@/components/scanner/SeverityBadge'
import { ScoreRing } from '@/components/scanner/ScoreRing'
import type { ScanResult } from '@/types'
import { Clock, Trash2, FileCode, Search, Zap, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export default function HistoryPage() {
  const [history, setHistory] = useState<ScanResult[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ScanResult | null>(null)

  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem('devaudit_history') || '[]')
      setHistory(h)
    } catch {}
  }, [])

  const clearHistory = () => {
    localStorage.removeItem('devaudit_history')
    setHistory([]); setSelected(null)
  }

  const filtered = history.filter(s =>
    (s.language || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.fileName || '').toLowerCase().includes(search.toLowerCase()) ||
    s.vulnerabilities.some(v => v.title.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Scan History</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">{history.length} scans stored locally</p>
          </div>
          {history.length > 0 && (
            <button onClick={clearHistory} className="btn-secondary text-sm text-red-400 hover:text-red-300">
              <Trash2 className="w-4 h-4" /> Clear all
            </button>
          )}
        </div>

        {history.length > 0 && (
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input pl-9" placeholder="Search by language, file, or vulnerability..." />
          </div>
        )}

        {history.length === 0 ? (
          <div className="card p-16 text-center">
            <Clock className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-4" />
            <h3 className="font-bold text-white mb-2">No scan history yet</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Your scans will appear here after you run them.</p>
            <Link href="/dashboard" className="btn-primary inline-flex">Start scanning →</Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-[var(--text-secondary)]">No results for "{search}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-3">
              {filtered.map(scan => {
                const crit = scan.vulnerabilities.filter(v => v.severity === 'CRITICAL').length
                const high = scan.vulnerabilities.filter(v => v.severity === 'HIGH').length
                return (
                  <button
                    key={scan.id}
                    onClick={() => setSelected(scan)}
                    className={`card p-4 w-full text-left hover:border-[var(--border-hover)] transition-all ${selected?.id === scan.id ? 'ring-1 ring-red-500/40 border-red-500/30' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <ScoreRing score={scan.securityScore} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono bg-white/5 px-2 py-0.5 rounded text-[var(--text-secondary)]">{scan.language}</span>
                          {scan.fileName && <span className="text-xs text-[var(--text-muted)] truncate">{scan.fileName}</span>}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {crit > 0 && <span className="text-xs sev-critical border rounded px-1.5 py-0.5">{crit} critical</span>}
                          {high > 0 && <span className="text-xs sev-high border rounded px-1.5 py-0.5">{high} high</span>}
                          {scan.vulnerabilities.length === 0 && <span className="text-xs text-green-400">Clean</span>}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          {formatDistanceToNow(new Date(scan.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] mt-1 flex-shrink-0" />
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="lg:col-span-2">
              {selected ? (
                <div className="card p-5 space-y-4">
                  <div className="flex items-start gap-4 pb-4 border-b border-[var(--border)]">
                    <ScoreRing score={selected.securityScore} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white">{selected.language}</span>
                        {selected.fileName && <span className="text-sm text-[var(--text-muted)] font-mono">{selected.fileName}</span>}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{selected.summary}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-1"><FileCode className="w-3 h-3" />{selected.linesScanned} lines</span>
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{selected.vulnerabilities.length} issues</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{(selected.scanDuration/1000).toFixed(1)}s</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {selected.vulnerabilities.map(v => (
                      <div key={v.id} className={`p-3 rounded-lg border-l-2 card ${severityBorder(v.severity as any)}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <SeverityBadge severity={v.severity} />
                          <span className="text-sm font-semibold text-white">{v.title}</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{v.description}</p>
                        {v.cwe && <span className="text-xs font-mono text-[var(--text-muted)] mt-1 inline-block">{v.cwe}</span>}
                      </div>
                    ))}
                    {selected.vulnerabilities.length === 0 && (
                      <div className="text-center py-8 text-green-400">
                        <p className="font-semibold">No vulnerabilities found in this scan.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card p-10 text-center h-full flex flex-col items-center justify-center">
                  <ChevronRight className="w-8 h-8 text-[var(--text-muted)] mb-3" />
                  <p className="text-[var(--text-secondary)]">Select a scan to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function severityBorder(sev: string) {
  return { CRITICAL: 'border-red-500', HIGH: 'border-orange-500', MEDIUM: 'border-yellow-500', LOW: 'border-blue-500', INFO: 'border-gray-500' }[sev] || 'border-gray-500'
}
