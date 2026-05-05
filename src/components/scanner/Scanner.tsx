'use client'
import { useState, useRef, useCallback } from 'react'
import { Upload, Play, Trash2, Copy, Download, ChevronDown, ChevronRight, Shield, AlertTriangle, Info, Zap, Clock, FileCode, CheckCircle2 } from 'lucide-react'
import type { ScanResult, Vulnerability, Severity } from '@/types'
import { ScoreRing } from './ScoreRing'
import { SeverityBadge } from './SeverityBadge'

const LANGUAGES = [
  'auto-detect','JavaScript','TypeScript','Python','Java','C','C++','Go','Rust','PHP','Ruby','SQL','Bash','C#','Kotlin','Swift','Solidity','YAML'
]

const EXT_MAP: Record<string, string> = {
  js:'JavaScript',ts:'TypeScript',jsx:'JavaScript',tsx:'TypeScript',py:'Python',
  java:'Java',c:'C',cpp:'C++',go:'Go',rs:'Rust',php:'PHP',rb:'Ruby',sql:'SQL',
  sh:'Bash',bash:'Bash',kt:'Kotlin',swift:'Swift',cs:'C#',sol:'Solidity',yml:'YAML',yaml:'YAML'
}

type FilterSev = 'all' | Severity

export function Scanner() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('auto-detect')
  const [fileName, setFileName] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterSev>('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [dragging, setDragging] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const loadFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (EXT_MAP[ext]) setLanguage(EXT_MAP[ext])
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = e => setCode(e.target?.result as string || '')
    reader.readAsText(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) loadFile(file)
  }, [])

  const scan = async () => {
    if (!code.trim()) return
    setScanning(true); setError(null); setResult(null); setFilter('all'); setExpanded(new Set())
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: language === 'auto-detect' ? 'auto' : language, fileName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scan failed')
      setResult(data)
      // Save to history in localStorage
      try {
        const history = JSON.parse(localStorage.getItem('devaudit_history') || '[]')
        history.unshift(data)
        localStorage.setItem('devaudit_history', JSON.stringify(history.slice(0, 50)))
      } catch {}
    } catch (err: any) {
      setError(err.message)
    } finally {
      setScanning(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const downloadReport = () => {
    if (!result) return
    const report = generateReport(result)
    const blob = new Blob([report], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `devaudit-report-${result.id.slice(0,8)}.md`; a.click()
    URL.revokeObjectURL(url)
  }

  const syntaxErrors = result?.syntaxErrors || []
  const filteredVulns = result
    ? (filter === 'all' ? result.vulnerabilities : result.vulnerabilities.filter(v => v.severity === filter))
    : []

  const counts = result ? countBySeverity(result.vulnerabilities) : null

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Left: Code Editor */}
      <div className="flex flex-col flex-1 min-w-0 card overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] flex-wrap">
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="input w-auto text-sm py-1.5 font-mono"
          >
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          <button onClick={() => fileRef.current?.click()} className="btn-secondary text-sm py-1.5">
            <Upload className="w-3.5 h-3.5" /> Upload
          </button>
          <input ref={fileRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && loadFile(e.target.files[0])} accept=".js,.ts,.jsx,.tsx,.py,.java,.c,.cpp,.go,.rs,.php,.rb,.sql,.sh,.bash,.kt,.swift,.cs,.sol,.yml,.yaml" />

          <button onClick={() => { setCode(''); setFileName(''); setResult(null); setError(null) }} className="btn-secondary text-sm py-1.5">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>

          {code && (
            <button onClick={copyCode} className="btn-ghost text-sm py-1.5 ml-auto">
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}

          <button
            onClick={scan}
            disabled={scanning || !code.trim()}
            className="btn-primary text-sm py-1.5"
          >
            {scanning ? (
              <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Scanning...</>
            ) : (
              <><Play className="w-3.5 h-3.5 fill-current" />Scan Code</>
            )}
          </button>
        </div>

        {/* File name display */}
        {fileName && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-red-500/5 border-b border-red-500/10">
            <FileCode className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs text-red-400 font-mono">{fileName}</span>
          </div>
        )}

        {/* Code textarea */}
        <div
          className="flex-1 relative min-h-[300px]"
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {dragging && (
            <div className="absolute inset-0 z-10 border-2 border-dashed border-red-500 bg-red-500/5 flex flex-col items-center justify-center gap-2 rounded-b-xl">
              <Upload className="w-8 h-8 text-red-400" />
              <p className="text-red-400 font-semibold">Drop your file here</p>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder={`// Paste your code here, or upload a file...\n\n// Example vulnerable code:\nconst query = "SELECT * FROM users WHERE id = " + userId;\neval(userInput);\ndocument.innerHTML = userData;\nconst secret = "hardcoded_api_key_12345";`}
            className="code-editor w-full h-full min-h-[300px] bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] p-4 resize-none outline-none"
            spellCheck={false}
          />
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-4 px-4 py-1.5 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
          <span className="text-xs text-[var(--text-muted)] font-mono">{code.split('\n').length} lines</span>
          <span className="text-xs text-[var(--text-muted)] font-mono">{code.length} chars</span>
          {language !== 'auto-detect' && <span className="text-xs text-red-400 font-mono ml-auto">{language}</span>}
        </div>
      </div>

      {/* Right: Results */}
      <div className="flex flex-col flex-1 min-w-0 card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <h2 className="font-bold text-white">Scan Results</h2>
          {result && (
            <button onClick={downloadReport} className="btn-ghost text-xs py-1">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          )}
        </div>

        {/* Results content */}
        <div className="flex-1 overflow-y-auto">
          {!result && !scanning && !error && (
            <EmptyState />
          )}

          {scanning && <ScanningState />}

          {error && (
            <div className="p-6 m-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <p className="font-semibold text-red-400">Scan failed</p>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{error}</p>
              {error.includes('API_KEY') && (
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Add your <span className="font-mono text-red-400">ANTHROPIC_API_KEY</span> to <span className="font-mono">.env.local</span>
                </p>
              )}
            </div>
          )}

          {result && (
            <div className="p-4 space-y-4 animate-fade-in">
              {/* Score + summary */}
              <div className="card p-4 flex items-start gap-4">
                <ScoreRing score={result.securityScore} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">Security Score</span>
                    <span className="text-xs font-mono text-[var(--text-muted)] bg-white/5 px-2 py-0.5 rounded-full">{result.language}</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{result.summary}</p>
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <Clock className="w-3.5 h-3.5" />
                      {(result.scanDuration / 1000).toFixed(1)}s
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <FileCode className="w-3.5 h-3.5" />
                      {result.linesScanned} lines
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <Zap className="w-3.5 h-3.5" />
                      {result.vulnerabilities.length} vulns | {syntaxErrors.length} syntax
                    </div>
                  </div>
                </div>
              </div>

              {/* Severity breakdown */}
              {counts && result.vulnerabilities.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['CRITICAL','HIGH','MEDIUM','LOW'] as Severity[]).map(sev => (
                    <button
                      key={sev}
                      onClick={() => setFilter(filter === sev ? 'all' : sev)}
                      className={`p-2 rounded-lg border text-center transition-all ${filter === sev ? 'ring-1 ring-white/20' : ''} sev-${sev.toLowerCase()}`}
                    >
                      <div className="text-xl font-bold">{counts[sev] || 0}</div>
                      <div className="text-xs opacity-75 uppercase tracking-wide">{sev}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Filter tabs */}
              {(result.vulnerabilities.length > 0 || syntaxErrors.length > 0) && (
                <div className="flex items-center gap-1 flex-wrap">
                  {(['all','CRITICAL','HIGH','MEDIUM','LOW','INFO'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${filter === f ? 'bg-white/10 border-white/20 text-white' : 'border-[var(--border)] text-[var(--text-muted)] hover:text-white hover:border-white/10'}`}
                    >
                      {f === 'all' ? `All (${result.vulnerabilities.length})` : `${f} (${counts?.[f as Severity] || 0})`}
                    </button>
                  ))}
                </div>
              )}

              {/* No vulnerabilities */}
              {result.vulnerabilities.length === 0 && (
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-7 h-7 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">
                    {syntaxErrors.length > 0 ? `${syntaxErrors.length} syntax error${syntaxErrors.length > 1 ? 's' : ''}` : 'No issues found'}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {syntaxErrors.length > 0 ? 'Fix syntax issues below.' : 'This code looks clean. Keep it up!'}
                  </p>
                </div>
              )}

              {/* Syntax errors */}
              {syntaxErrors.map((err, i) => (
                <div key={`syntax-${i}`} className="card p-4 border-yellow-500/20 bg-yellow-500/5 border-l-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-50 mb-1">Syntax Error</h4>
                      <p className="text-sm text-[var(--text-secondary)] mb-1">Line {err.line}</p>
                      <pre className="text-xs bg-yellow-500/10 p-2 rounded border border-yellow-500/20 font-mono">
                        {err.error}
                      </pre>
                      {err.fix && (
                        <div className="mt-2">
                          <p className="text-xs text-yellow-300 font-medium mb-1">Fix:</p>
                          <pre className="text-xs bg-green-500/10 p-2 rounded border border-green-500/20 font-mono text-green-200">
                            {err.fix}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Vuln cards */}
              {filteredVulns.map((v, i) => (
                <VulnCard
                  key={v.id}
                  vuln={v}
                  expanded={expanded.has(v.id)}
                  onToggle={() => toggleExpand(v.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function VulnCard({ vuln, expanded, onToggle }: { vuln: Vulnerability; expanded: boolean; onToggle: () => void }) {
  const [fixCopied, setFixCopied] = useState(false)

  const copyFix = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (vuln.fix) {
      navigator.clipboard.writeText(vuln.fix)
      setFixCopied(true); setTimeout(() => setFixCopied(false), 2000)
    }
  }

  return (
    <div className={`vuln-card card overflow-hidden border-l-2 ${severityBorder(vuln.severity)}`}>
      <button onClick={onToggle} className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-white/3 transition-colors">
        <SeverityBadge severity={vuln.severity} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm leading-tight">{vuln.title}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {vuln.line && <span className="text-xs font-mono text-[var(--text-muted)]">Line {vuln.line}</span>}
            {vuln.cwe && <span className="text-xs font-mono text-[var(--text-muted)] bg-white/5 px-1.5 py-0.5 rounded">{vuln.cwe}</span>}
            {vuln.owasp && <span className="text-xs font-mono text-[var(--text-muted)] bg-white/5 px-1.5 py-0.5 rounded">{vuln.owasp}</span>}
            <span className="text-xs text-[var(--text-muted)] bg-white/5 px-1.5 py-0.5 rounded">{vuln.category}</span>
          </div>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed pt-3">{vuln.description}</p>

          {vuln.snippet && (
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1.5 font-medium">Vulnerable code</p>
              <pre className="code-editor text-xs bg-red-500/5 border border-red-500/10 rounded-lg p-3 overflow-x-auto text-red-200 whitespace-pre-wrap break-words">
                {vuln.snippet}
              </pre>
            </div>
          )}

          {vuln.fix && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-green-400 uppercase tracking-wide font-medium">Recommended fix</p>
                <button onClick={copyFix} className="text-xs text-[var(--text-muted)] hover:text-white flex items-center gap-1 transition-colors">
                  {fixCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {fixCopied ? 'Copied' : 'Copy fix'}
                </button>
              </div>
              <pre className="code-editor text-xs bg-green-500/5 border border-green-500/10 rounded-lg p-3 overflow-x-auto text-green-200 whitespace-pre-wrap break-words">
                {vuln.fix}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-8 gap-4">
      <div className="w-16 h-16 bg-[var(--bg-hover)] rounded-2xl flex items-center justify-center">
        <Shield className="w-8 h-8 text-[var(--text-muted)]" />
      </div>
      <div>
        <h3 className="font-bold text-white mb-1">Ready to scan</h3>
        <p className="text-sm text-[var(--text-secondary)] max-w-[220px] leading-relaxed">
          Paste or upload code, then click Scan Code to find vulnerabilities.
        </p>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs w-full max-w-xs">
        {['SQL Injection','XSS','Hardcoded Secrets','Auth Flaws','Crypto Issues','Path Traversal'].map(f => (
          <div key={f} className="flex items-center gap-1.5 text-[var(--text-muted)]">
            <Info className="w-3 h-3 text-red-500/60 flex-shrink-0" />{f}
          </div>
        ))}
      </div>
    </div>
  )
}

function ScanningState() {
  const steps = ['Parsing code structure...','Running injection checks...','Checking authentication...','Analyzing crypto usage...','Scanning for secrets...','Generating report...']
  const [step, setStep] = useState(0)
  useState(() => {
    const iv = setInterval(() => setStep(s => (s + 1) % steps.length), 1200) as unknown as number
    return () => clearInterval(iv)
  })
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-5">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-[var(--border)]" />
        <div className="absolute inset-0 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield className="w-6 h-6 text-red-400" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-semibold text-white mb-1">Analyzing your code</p>
        <p className="text-sm text-[var(--text-muted)] animate-pulse-slow">{steps[step]}</p>
      </div>
    </div>
  )
}

function countBySeverity(vulns: Vulnerability[]) {
  return vulns.reduce((acc, v) => {
    acc[v.severity] = (acc[v.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

function severityBorder(sev: Severity) {
  const map: Record<Severity, string> = {
    CRITICAL: 'border-red-500',
    HIGH: 'border-orange-500',
    MEDIUM: 'border-yellow-500',
    LOW: 'border-blue-500',
    INFO: 'border-gray-500',
  }
  return map[sev] || 'border-gray-500'
}

function generateReport(result: ScanResult): string {
  const date = new Date(result.createdAt).toLocaleString()
  const lines = [
    `# DevAudit Security Report`,
    `**Generated:** ${date}`,
    `**Language:** ${result.language}`,
    `**Security Score:** ${result.securityScore}/100`,
    `**Lines Scanned:** ${result.linesScanned}`,
    result.fileName ? `**File:** ${result.fileName}` : '',
    ``,
    `## Summary`,
    result.summary,
    ``,
    `## Vulnerabilities (${result.vulnerabilities.length})`,
    ``,
  ]
  result.vulnerabilities.forEach((v, i) => {
    lines.push(`### ${i + 1}. [${v.severity}] ${v.title}`)
    if (v.line) lines.push(`- **Line:** ${v.line}`)
    if (v.cwe) lines.push(`- **CWE:** ${v.cwe}`)
    if (v.owasp) lines.push(`- **OWASP:** ${v.owasp}`)
    if (v.category) lines.push(`- **Category:** ${v.category}`)
    lines.push(``, v.description, ``)
    if (v.snippet) lines.push(`**Vulnerable Code:**\n\`\`\`\n${v.snippet}\n\`\`\``, ``)
    if (v.fix) lines.push(`**Fix:**\n\`\`\`\n${v.fix}\n\`\`\``, ``)
  })
  return lines.join('\n')
}
