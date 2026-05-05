'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Shield, LayoutDashboard, History, Settings, LogOut, ChevronDown, User, Code2 } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--bg-secondary)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center group-hover:bg-red-600 transition-colors">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">DevAudit</span>
            <span className="hidden sm:block text-xs text-[var(--text-muted)] font-mono bg-white/5 px-2 py-0.5 rounded-full border border-[var(--border)]">
              v2.0
            </span>
          </Link>

          {session && (
            <div className="hidden md:flex items-center gap-1">
              <Link href="/dashboard" className="btn-ghost text-sm">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/history" className="btn-ghost text-sm">
                <History className="w-4 h-4" />
                History
              </Link>
              <Link href="/settings" className="btn-ghost text-sm">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 bg-[var(--bg-hover)] hover:bg-white/10 border border-[var(--border)] rounded-lg px-3 py-1.5 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <span className="text-sm text-[var(--text-primary)] max-w-[120px] truncate">
                    {session.user?.name || session.user?.email}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 card shadow-2xl overflow-hidden z-50">
                    <div className="px-3 py-2 border-b border-[var(--border)]">
                      <p className="text-xs text-[var(--text-muted)]">Signed in as</p>
                      <p className="text-sm text-white truncate font-medium">{session.user?.email}</p>
                    </div>
                    <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors" onClick={() => setMenuOpen(false)}>
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/sign-in' })}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/sign-in" className="btn-ghost text-sm">Sign in</Link>
                <Link href="/sign-up" className="btn-primary text-sm">Get started</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
