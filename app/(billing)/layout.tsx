export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function BillingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white text-sm">
              🚗
            </div>
            <span className="text-[15px] font-extrabold tracking-tight text-[#18222f]">
              Drive<span className="text-accent">Ledger</span>
            </span>
          </Link>
          <Link href="/dashboard"
            className="text-xs text-dim font-medium hover:text-[#18222f] transition-colors">
            ← Back to app
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  )
}
