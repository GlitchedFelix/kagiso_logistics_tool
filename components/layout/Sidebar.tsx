'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { trialDaysLeft, type Subscription } from '@/lib/subscription'

interface SidebarProps {
  subscription: Subscription | null
}

const NAV = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/trips',     icon: '🚗', label: 'Trips' },
  { href: '/expenses',  icon: '💸', label: 'Expenses' },
  { href: '/settings',  icon: '⚙️',  label: 'Settings' },
]

export default function Sidebar({ subscription }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const daysLeft = trialDaysLeft(subscription)
  const isTrial = subscription?.status === 'trialing'

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-border min-h-screen
                        fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white text-base">
            🚗
          </div>
          <span className="text-[15px] font-extrabold tracking-tight text-[#18222f]">
            Drive<span className="text-accent">Ledger</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                          transition-colors ${
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-accent-soft text-accent'
                  : 'text-dim hover:bg-surface2 hover:text-[#18222f]'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Trial / subscription badge */}
        {isTrial && daysLeft > 0 && (
          <div className="mx-3 mb-3 p-3 bg-amber-soft border border-amber/20 rounded-lg">
            <p className="text-xs font-semibold text-amber mb-1">
              {daysLeft} day{daysLeft !== 1 ? 's' : ''} left in trial
            </p>
            <Link
              href="/subscribe"
              className="text-xs font-bold text-amber underline underline-offset-2"
            >
              Subscribe now →
            </Link>
          </div>
        )}

        {/* Sign out */}
        <div className="px-3 pb-4 border-t border-border pt-3">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                       text-dim hover:bg-red/5 hover:text-red transition-colors"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3
                         bg-white border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white text-sm">
            🚗
          </div>
          <span className="text-sm font-extrabold tracking-tight text-[#18222f]">
            Drive<span className="text-accent">Ledger</span>
          </span>
        </div>
        <button
          onClick={signOut}
          className="text-xs text-dim font-medium px-3 py-1.5 border border-border rounded-md
                     hover:border-[#b0b8c4] transition-colors"
        >
          Sign Out
        </button>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border
                      flex" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5
                        text-[10px] font-semibold transition-colors ${
              pathname === item.href
                ? 'text-accent border-t-2 border-accent'
                : 'text-faint border-t-2 border-transparent'
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
