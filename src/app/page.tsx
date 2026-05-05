import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Shield, Zap, Lock, FileCode, ArrowRight, CheckCircle2 } from 'lucide-react'

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Nav */}
      <nav className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-white">DevAudit</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">Sign in</Link>
          <Link href="/sign-up" className="btn-primary text-sm">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-6">
          <Zap className="w-3.5 h-3.5 text-red-400" />
          <span className="text-xs text-red-400 font-medium">Powered by Pranav Jasyal</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight max-w-3xl">
          Find security flaws<br />
          <span className="text-red-500">before attackers do</span>
        </h1>

        <p className="text-lg text-[var(--text-secondary)] mt-6 max-w-xl leading-relaxed">
          DevAudit uses AI to scan your code for SQL injection, XSS, authentication flaws, hardcoded secrets, and 50+ other vulnerability types — with instant fix suggestions.
        </p>

        <div className="flex items-center gap-4 mt-8 flex-wrap justify-center">
          <Link href="/sign-up" className="btn-primary text-base px-6 py-3">
            Start scanning free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/sign-in" className="btn-secondary text-base px-6 py-3">
            Sign in
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-3xl w-full">
          {[
            { icon: Shield, title: '50+ Vulnerability Types', desc: 'SQL injection, XSS, CSRF, path traversal, hardcoded secrets, weak crypto, and more.' },
            { icon: Zap, title: 'Instant AI Analysis', desc: 'Get detailed reports with explanations and working fix code in seconds.' },
            { icon: FileCode, title: '16+ Languages', desc: 'JavaScript, Python, Java, Go, Rust, PHP, C/C++, SQL, Bash, and more.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5 text-left">
              <div className="w-9 h-9 bg-red-500/10 rounded-lg flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="font-bold text-white mb-1.5">{title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Checklist */}
        <div className="mt-12 flex flex-wrap gap-x-8 gap-y-2 justify-center">
          {['No credit card required', 'Works on any language', 'Export PDF reports', 'Scan history', 'GitHub OAuth'].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <CheckCircle2 className="w-4 h-4 text-green-500" />{f}
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--text-muted)]">
        © 2025 DevAudit · Built by Pranav Jasyal
      </footer>
    </div>
  )
}
