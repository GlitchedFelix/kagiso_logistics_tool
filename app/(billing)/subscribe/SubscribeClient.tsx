'use client'

import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Props {
  email: string
  name: string
  userId: string
  isActive: boolean
  daysLeft: number
  currentPlan: string | null
}

export default function SubscribeClient({ email, name, userId, isActive, daysLeft, currentPlan }: Props) {
  const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null)

  async function subscribe(plan: 'monthly' | 'annual') {
    setLoading(plan)
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email, name, userId }),
      })

      const { checkoutUrl, error } = await res.json()

      if (error || !checkoutUrl) {
        toast.error(error || 'Failed to create checkout')
        setLoading(null)
        return
      }

      window.location.href = checkoutUrl
    } catch {
      toast.error('Something went wrong')
      setLoading(null)
    }
  }

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#18222f] mb-2">
          {isActive ? 'Manage Subscription' : 'Start Your Subscription'}
        </h1>
        {isActive && currentPlan ? (
          <p className="text-dim">You&apos;re on the <strong>{currentPlan}</strong> plan</p>
        ) : daysLeft > 0 ? (
          <p className="text-dim">
            Your trial has <strong className="text-amber">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong> left.
            Subscribe to keep full access.
          </p>
        ) : (
          <p className="text-dim">
            Your trial has ended. Choose a plan to continue using DriveLedger.
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">

        {/* Monthly */}
        <div className="bg-white border-2 border-border rounded-card shadow-sm p-6
                        hover:border-accent/50 transition-colors">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-dim mb-1">Monthly</p>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-extrabold tracking-tight text-[#18222f]">R99</span>
              <span className="text-dim text-sm mb-1">/month</span>
            </div>
          </div>
          <ul className="space-y-2 mb-6 text-sm text-dim">
            {['Unlimited trip logging', 'Full dashboard & charts', 'Expense tracking', 'Excel export', 'Cancel anytime'].map(f => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-green font-bold">✓</span> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => subscribe('monthly')}
            disabled={loading !== null || (isActive && currentPlan === 'monthly')}
            className="w-full py-2.5 border-2 border-accent text-accent font-semibold text-sm
                       rounded-sm hover:bg-accent hover:text-white transition-colors disabled:opacity-50"
          >
            {loading === 'monthly'
              ? 'Redirecting…'
              : (isActive && currentPlan === 'monthly')
                ? 'Current Plan'
                : 'Subscribe Monthly'
            }
          </button>
        </div>

        {/* Annual */}
        <div className="bg-white border-2 border-accent rounded-card shadow-card p-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Best Value
            </span>
          </div>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-dim mb-1">Annual</p>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-extrabold tracking-tight text-[#18222f]">R899</span>
              <span className="text-dim text-sm mb-1">/year</span>
            </div>
            <p className="text-xs text-green font-semibold mt-1">Save R289 vs monthly</p>
          </div>
          <ul className="space-y-2 mb-6 text-sm text-dim">
            {['Everything in Monthly', '2 months free', 'Priority support', 'Early access to new features'].map(f => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-green font-bold">✓</span> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => subscribe('annual')}
            disabled={loading !== null || (isActive && currentPlan === 'annual')}
            className="w-full py-2.5 bg-accent hover:bg-accent-dark text-white font-semibold text-sm
                       rounded-sm transition-colors disabled:opacity-50"
          >
            {loading === 'annual'
              ? 'Redirecting…'
              : (isActive && currentPlan === 'annual')
                ? 'Current Plan'
                : 'Subscribe Annually'
            }
          </button>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-xs text-faint">
          Payments secured by PayFast · South African payment gateway
        </p>
        <p className="text-xs text-faint">
          Cancel anytime from your{' '}
          <Link href="/billing" className="text-accent hover:underline">billing page</Link>
        </p>
        {isActive && (
          <Link href="/dashboard"
            className="inline-block mt-3 text-sm text-dim font-medium hover:text-[#18222f] transition-colors">
            ← Back to Dashboard
          </Link>
        )}
      </div>
    </div>
  )
}
