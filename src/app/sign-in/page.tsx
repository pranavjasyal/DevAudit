'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Github, Mail, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await signIn('credentials', { email, password, action: 'signin', redirect: false })
    setLoading(false)
    if (res?.error) setError(res.error === 'CredentialsSignin' ? 'Invalid email or password' : res.error)
    else router.push('/dashboard')
  }

  const handleOAuth = async (provider: string) => {
    setOauthLoading(provider)
    await signIn(provider, { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-primary)]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">Sign in to DevAudit</p>
        </div>

        <div className="card p-6 space-y-4">
          {/* OAuth Buttons */}
          <button
            onClick={() => handleOAuth('github')}
            disabled={!!oauthLoading}
            className="btn-secondary w-full justify-center py-2.5"
          >
            {oauthLoading === 'github' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
            Continue with GitHub
          </button>

          <button
            onClick={() => handleOAuth('google')}
            disabled={!!oauthLoading}
            className="btn-secondary w-full justify-center py-2.5"
          >
            {oauthLoading === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--text-muted)]">or</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                  className="input pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</> : <>
                <Mail className="w-4 h-4" />Sign in with Email</>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-4">
          Don't have an account?{' '}
          <Link href="/sign-up" className="text-red-400 hover:text-red-300 font-medium transition-colors">Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
