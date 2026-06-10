'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-[#18222f] mb-2">Email sent</h2>
          <p className="text-sm text-dim mb-6">
            Check <strong>{email}</strong> for a password reset link.
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
          <h2 className="text-lg font-bold text-[#18222f] mb-1">Reset password</h2>
          <p className="text-sm text-dim mb-6">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2.5 text-sm border border-[#d6dce5] rounded-sm outline-none
                           focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent hover:bg-accent-dark text-white font-semibold
                         rounded-sm transition-colors disabled:opacity-60 text-sm"
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center text-xs text-dim mt-5">
            <Link href="/login" className="text-accent font-semibold hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
