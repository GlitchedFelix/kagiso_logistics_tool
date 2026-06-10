export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { trialDaysLeft, isSubscriptionActive, type Subscription } from '@/lib/subscription'
import SubscribeClient from './SubscribeClient'

export default async function SubscribePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  const subscription = sub as Subscription | null
  const active       = isSubscriptionActive(subscription)
  const daysLeft     = trialDaysLeft(subscription)
  const email        = user!.email || ''
  const name         = profile?.full_name || email

  return (
    <SubscribeClient
      email={email}
      name={name}
      userId={user!.id}
      isActive={active}
      daysLeft={daysLeft}
      currentPlan={subscription?.plan || null}
    />
  )
}
