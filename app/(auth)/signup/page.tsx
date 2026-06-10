'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [platform, setPlatform] = useState('Uber')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, platform },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-[#18222f] mb-2">Check your email</h2>
          <p className="text-sm text-dim mb-6">
            We&apos;ve sent a confirmation link to <strong>{email}</strong>.<br />
            Click it to activate your account and start your 7-day free trial.
          </p>
          <Link href="/login" className="text-accent text-sm font-semibold hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white text-xl shadow-lg">
            🚗
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#18222f]">
            Drive<span className="text-accent">Ledger</span>
          </h1>
        </div>

        <div className="bg-white border border-border rounded-card shadow-card p-8">
          {/* Trial badge */}
          <div className="inline-flex items-center gap-1.5 bg-green/10 text-green text-xs font-semibold
                          px-3 py-1.5 rounded-full mb-4">
            ✓ 7-day free trial — no card required
          </div>

          <h2 className="text-lg font-bold text-[#18222f] mb-1">Create your account</h2>
          <p className="text-sm text-dim mb-6">Start tracking your rideshare earnings today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Kagiso Sithole"
                required
                className="w-full px-3 py-2.5 text-sm border border-[#d6dce5] rounded-sm outline-none
                           focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>

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
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
                className="w-full px-3 py-2.5 text-sm border border-[#d6dce5] rounded-sm outline-none
                           focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">Primary platform</label>
              <select
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#d6dce5] rounded-sm outline-none
                           focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all bg-white"
              >
                <option>Uber</option>
                <option>Bolt</option>
                <option>InDrive</option>
                <option>Other</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent hover:bg-accent-dark text-white font-semibold
                         rounded-sm transition-colors disabled:opacity-60 text-sm"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-dim mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-accent font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
