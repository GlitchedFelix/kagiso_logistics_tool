export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired' | 'inactive'

export interface Subscription {
  id: string
  user_id: string
  status: SubscriptionStatus
  plan: string
  amount_cents: number
  trial_ends_at: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export function isSubscriptionActive(sub: Subscription | null | undefined): boolean {
  if (!sub) return false
  if (sub.status === 'active') return true
  if (sub.status === 'trialing' && sub.trial_ends_at) {
    return new Date(sub.trial_ends_at) > new Date()
  }
  return false
}

export function trialDaysLeft(sub: Subscription | null | undefined): number {
  if (!sub?.trial_ends_at) return 0
  const diff = new Date(sub.trial_ends_at).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
