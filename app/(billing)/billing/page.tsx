export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { isSubscriptionActive, trialDaysLeft, type Subscription } from '@/lib/subscription'
import Link from 'next/link'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  const subscription = sub as Subscription | null
  const active    = isSubscriptionActive(subscription)
  const daysLeft  = trialDaysLeft(subscription)
  const isTrial   = subscription?.status === 'trialing'

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    active:   { label: 'Active',    color: 'bg-green/10 text-green border-green/20' },
    trialing: { label: 'Trial',     color: 'bg-amber/10 text-amber border-amber/20' },
    past_due: { label: 'Past Due',  color: 'bg-red/10 text-red border-red/20' },
    cancelled:{ label: 'Cancelled', color: 'bg-surface3 text-dim border-border' },
    expired:  { label: 'Expired',   color: 'bg-red/10 text-red border-red/20' },
    inactive: { label: 'Inactive',  color: 'bg-surface3 text-dim border-border' },
  }

  const statusInfo = STATUS_LABELS[subscription?.status || 'inactive'] ||
                     STATUS_LABELS['inactive']

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-extrabold tracking-tight text-[#18222f] mb-2">Billing</h1>
      <p className="text-sm text-dim mb-8">Manage your DriveLedger subscription</p>

      <div className="bg-white border border-border rounded-card shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#18222f] mb-1">Current Plan</h2>
            <p className="text-2xl font-extrabold tracking-tight text-[#18222f]">
              {subscription?.plan === 'monthly' ? 'Monthly — R99/mo'  :
               subscription?.plan === 'annual'  ? 'Annual — R899/yr'  :
               'No Plan'}
            </p>
          </div>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {isTrial && (
          <div className="bg-amber/10 border border-amber/20 rounded-lg p-3 mb-4">
            <p className="text-xs font-semibold text-amber">
              Trial — {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
            </p>
          </div>
        )}

        {subscription?.current_period_end && active && !isTrial && (
          <div className="text-sm text-dim space-y-1 border-t border-border pt-4 mt-4">
            <div className="flex justify-between">
              <span>Next billing date</span>
              <span className="font-medium text-[#18222f]">
                {new Date(subscription.current_period_end).toLocaleDateString('en-ZA', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </span>
            </div>
            {subscription.cancel_at_period_end && (
              <div className="flex justify-between text-red">
                <span>Cancels at end of period</span>
                <span>✓</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {!active || isTrial ? (
          <Link href="/subscribe"
            className="px-5 py-2.5 bg-accent hover:bg-accent-dark text-white text-sm font-semibold
                       rounded-sm transition-colors">
            Subscribe Now
          </Link>
        ) : (
          <Link href="/subscribe"
            className="px-5 py-2.5 border border-border text-dim text-sm font-semibold
                       rounded-sm hover:border-[#b0b8c4] transition-colors">
            Change Plan
          </Link>
        )}
        <Link href="/settings"
          className="px-5 py-2.5 border border-border text-dim text-sm font-semibold
                     rounded-sm hover:border-[#b0b8c4] transition-colors">
          ← Settings
        </Link>
      </div>

      <div className="mt-8 p-4 bg-surface2 border border-border rounded-lg">
        <p className="text-xs text-dim">
          <strong>Need to cancel?</strong> Subscriptions can be managed directly through PayFast.
          Contact us at{' '}
          <a href="mailto:support@driveledger.app" className="text-accent hover:underline">
            support@driveledger.app
          </a>
          {' '}and we&apos;ll assist you immediately.
        </p>
      </div>
    </div>
  )
}
