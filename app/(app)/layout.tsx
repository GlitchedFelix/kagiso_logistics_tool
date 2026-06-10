export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import type { Subscription } from '@/lib/subscription'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar subscription={subscription as Subscription | null} />

      {/* Main content — offset for sidebar on desktop */}
      <main className="flex-1 md:ml-56 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
