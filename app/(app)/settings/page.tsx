'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { trialDaysLeft, isSubscriptionActive, type Subscription } from '@/lib/subscription'
import PageHeader from '@/components/ui/PageHeader'
import Link from 'next/link'
import toast from 'react-hot-toast'

const PLATFORMS = ['Uber', 'Bolt', 'InDrive', 'Other']

export default function SettingsPage() {
  const [profile, setProfile] = useState({ full_name: '', phone: '', platform: 'Uber', city: '' })
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading]  = useState(true)
  const [saving, setSaving]    = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profRes, subRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
      ])

      if (profRes.data) {
        setProfile({
          full_name: profRes.data.full_name || '',
          phone:     profRes.data.phone || '',
          platform:  profRes.data.platform || 'Uber',
          city:      profRes.data.city || '',
        })
      }

      setSubscription(subRes.data as Subscription | null)
      setLoading(false)
    }
    load()
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('profiles')
      .update({ ...profile })
      .eq('id', user!.id)

    setSaving(false)
    if (error) { toast.error('Failed to save'); return }
    toast.success('Profile saved!')
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (password !== confirmPw) { toast.error('Passwords do not match'); return }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { toast.error(error.message); return }

    toast.success('Password updated!')
    setPassword(''); setConfirmPw('')
  }

  const inputCls = `w-full px-3 py-2.5 text-sm border border-[#d6dce5] rounded-sm outline-none
                    focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all bg-white`
  const labelCls = `block text-xs font-medium text-dim mb-1.5`

  const active    = isSubscriptionActive(subscription)
  const daysLeft  = trialDaysLeft(subscription)
  const isTrial   = subscription?.status === 'trialing'

  return (
    <div>
      <PageHeader title="Settings" />

      {loading ? (
        <div className="text-center py-16 text-dim text-sm">Loading…</div>
      ) : (
        <div className="space-y-6 max-w-xl">

          {/* Subscription status */}
          <div className="bg-white border border-border rounded-card shadow-sm p-5">
            <h2 className="text-sm font-bold text-[#18222f] mb-4">Subscription</h2>

            <div className={`flex items-center gap-3 p-3 rounded-lg mb-4 ${
              active ? 'bg-green/10 border border-green/20' : 'bg-red/5 border border-red/20'
            }`}>
              <span className="text-xl">{active ? '✅' : '❌'}</span>
              <div>
                <p className={`text-sm font-semibold ${active ? 'text-green' : 'text-red'}`}>
                  {active
                    ? (isTrial ? `Free trial — ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Active subscription')
                    : 'No active subscription'
                  }
                </p>
                <p className="text-xs text-dim mt-0.5">
                  {subscription?.plan === 'monthly' ? 'Monthly plan · R99/month' :
                   subscription?.plan === 'annual'  ? 'Annual plan · R899/year' :
                   'Trial period'}
                </p>
                {subscription?.current_period_end && (
                  <p className="text-xs text-faint mt-0.5">
                    Renews {new Date(subscription.current_period_end).toLocaleDateString('en-ZA')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {!active || isTrial ? (
                <Link href="/subscribe"
                  className="px-4 py-2 bg-accent hover:bg-accent-dark text-white text-sm
                             font-semibold rounded-sm transition-colors">
                  Subscribe Now
                </Link>
              ) : (
                <Link href="/billing"
                  className="px-4 py-2 text-sm font-semibold text-dim border border-border
                             rounded-sm hover:border-[#b0b8c4] transition-colors">
                  Manage Billing
                </Link>
              )}
            </div>
          </div>

          {/* Profile */}
          <div className="bg-white border border-border rounded-card shadow-sm p-5">
            <h2 className="text-sm font-bold text-[#18222f] mb-4">Profile</h2>
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <input type="text" value={profile.full_name}
                  onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input type="tel" value={profile.phone}
                  onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+27 82 000 0000" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Primary Platform</label>
                <select value={profile.platform}
                  onChange={e => setProfile(p => ({ ...p, platform: e.target.value }))}
                  className={inputCls}>
                  {PLATFORMS.map(pl => <option key={pl}>{pl}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input type="text" value={profile.city}
                  onChange={e => setProfile(p => ({ ...p, city: e.target.value }))}
                  placeholder="Johannesburg" className={inputCls} />
              </div>
              <button type="submit" disabled={saving}
                className="px-5 py-2 bg-accent hover:bg-accent-dark text-white text-sm font-semibold
                           rounded-sm transition-colors disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Change password */}
          <div className="bg-white border border-border rounded-card shadow-sm p-5">
            <h2 className="text-sm font-bold text-[#18222f] mb-4">Change Password</h2>
            <form onSubmit={changePassword} className="space-y-4">
              <div>
                <label className={labelCls}>New Password</label>
                <input type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters" autoComplete="new-password"
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Confirm Password</label>
                <input type="password" value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Repeat password" autoComplete="new-password"
                  className={inputCls} />
              </div>
              <button type="submit"
                className="px-5 py-2 bg-accent hover:bg-accent-dark text-white text-sm font-semibold
                           rounded-sm transition-colors">
                Update Password
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  )
}
