'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Github, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    const res = await signIn('credentials', { name, email, password, action: 'signup', redirect: false })
    setLoading(false)
    if (res?.error) setError(res.error)
    else router.push('/dashboard')
  }

  const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-primary)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">Start scanning code for free</p>
        </div>

        <div className="card p-6 space-y-4">
          <button
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            className="btn-secondary w-full justify-center py-2.5"
          >
            <Github className="w-4 h-4" />Continue with GitHub
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--text-muted)]">or sign up with email</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Full name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="input" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                  className="input pr-10" placeholder="Min. 6 characters" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-[var(--border)]'}`} />
                  ))}
                  <span className="text-xs text-[var(--text-muted)] ml-1 w-10">{strengthLabels[strength]}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account...</> : <>
                <CheckCircle2 className="w-4 h-4" />Create account</>}
            </button>
          </form>

          <p className="text-center text-xs text-[var(--text-muted)]">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-4">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-red-400 hover:text-red-300 font-medium transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
