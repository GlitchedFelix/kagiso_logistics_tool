'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white text-xl shadow-lg">
            🚗
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#18222f]">
            Drive<span className="text-accent">Ledger</span>
          </h1>
        </div>

        <div className="bg-white border border-border rounded-card shadow-card p-8">
          <h2 className="text-lg font-bold text-[#18222f] mb-1">Welcome back</h2>
          <p className="text-sm text-dim mb-6">Sign in to your driver account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full px-3 py-2.5 text-sm border border-[#d6dce5] rounded-sm outline-none
                           focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full px-3 py-2.5 text-sm border border-[#d6dce5] rounded-sm outline-none
                           focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>

            <div className="flex justify-end">
              <Link href="/reset-password" className="text-xs text-accent hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent hover:bg-accent-dark text-white font-semibold
                         rounded-sm transition-colors disabled:opacity-60 text-sm"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-dim mt-5">
            No account?{' '}
            <Link href="/signup" className="text-accent font-semibold hover:underline">
              Sign up free
            </Link>
            {' '}— 7-day trial included
          </p>
        </div>
      </div>
    </div>
  )
}
