'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { money, sum, round2, netEarnings, currentMonthKey, num } from '@/lib/utils'
import StatCard from '@/components/ui/StatCard'
import SectionLabel from '@/components/ui/SectionLabel'
import PageHeader from '@/components/ui/PageHeader'
import EarningsChart from '@/components/dashboard/EarningsChart'
import PlatformChart from '@/components/dashboard/PlatformChart'

interface Trip {
  trip_date: string
  platform: string
  earnings: number
  tip: number
  bonus: number
  platform_fee: number
  duration_minutes: number | null
}

interface Expense {
  expense_date: string
  category: string
  amount: number
}

export default function DashboardPage() {
  const [trips, setTrips]       = useState<Trip[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading]   = useState(true)
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd,   setFilterEnd]   = useState('')
  const [filterPlatform, setFilterPlatform] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const [tripsRes, expRes] = await Promise.all([
      supabase.from('trips').select('*').order('trip_date', { ascending: false }),
      supabase.from('expenses').select('*').order('expense_date', { ascending: false }),
    ])
    setTrips(tripsRes.data || [])
    setExpenses(expRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const inRange = (d: string) =>
    (!filterStart || d >= filterStart) && (!filterEnd || d <= filterEnd)

  const filteredTrips = trips.filter(t =>
    inRange(t.trip_date) && (!filterPlatform || t.platform === filterPlatform)
  )
  const filteredExpenses = expenses.filter(e => inRange(e.expense_date))

  const totalNet     = sum(filteredTrips, t => netEarnings(t))
  const totalGross   = sum(filteredTrips, t => num(t.earnings))
  const totalTips    = sum(filteredTrips, t => num(t.tip))
  const totalFees    = sum(filteredTrips, t => num(t.platform_fee))
  const totalExpenses = sum(filteredExpenses, e => num(e.amount))
  const profit       = round2(totalNet - totalExpenses)
  const avgPerTrip   = filteredTrips.length ? round2(totalNet / filteredTrips.length) : 0
  const totalMins    = filteredTrips.reduce((s, t) => s + (t.duration_minutes || 0), 0)
  const avgPerHour   = totalMins > 0 ? round2(totalNet / (totalMins / 60)) : 0

  const mo           = currentMonthKey()
  const monthTrips   = trips.filter(t => (t.trip_date || '').startsWith(mo))
  const monthExpenses= expenses.filter(e => (e.expense_date || '').startsWith(mo))
  const monthNet     = sum(monthTrips, t => netEarnings(t))
  const monthExp     = sum(monthExpenses, e => num(e.amount))

  const platforms = [...new Set(trips.map(t => t.platform))]

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your rideshare earnings at a glance"
      />

      {/* Filter bar */}
      <div className="bg-white border border-border rounded-card shadow-sm p-4 mb-6
                      flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-dim mb-1">From</label>
          <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)}
            className="px-3 py-2 text-sm border border-[#d6dce5] rounded-sm outline-none
                       focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" />
        </div>
        <div>
          <label className="block text-xs font-medium text-dim mb-1">To</label>
          <input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)}
            className="px-3 py-2 text-sm border border-[#d6dce5] rounded-sm outline-none
                       focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" />
        </div>
        <div>
          <label className="block text-xs font-medium text-dim mb-1">Platform</label>
          <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}
            className="px-3 py-2 text-sm border border-[#d6dce5] rounded-sm outline-none
                       focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all bg-white">
            <option value="">All Platforms</option>
            {platforms.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <button
          onClick={() => { setFilterStart(''); setFilterEnd(''); setFilterPlatform('') }}
          className="px-4 py-2 text-sm font-semibold text-dim border border-border rounded-sm
                     hover:border-[#b0b8c4] transition-colors"
        >
          Clear
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-dim text-sm">Loading…</div>
      ) : (
        <>
          {/* This Month spotlight */}
          <SectionLabel>This Month</SectionLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Net Earnings" value={money(monthNet)} color="green"
              sub={`${monthTrips.length} trips`} />
            <StatCard label="Expenses" value={money(monthExp)} color="red"
              sub="this month" />
            <StatCard label="Month Profit" value={money(monthNet - monthExp)}
              color={(monthNet - monthExp) >= 0 ? 'green' : 'red'} />
            <StatCard label="Trips" value={String(monthTrips.length)}
              sub="this month" />
          </div>

          {/* Period KPIs */}
          <SectionLabel>
            {filterStart || filterEnd || filterPlatform ? 'Filtered Period' : 'All Time'}
          </SectionLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Gross Earnings" value={money(totalGross)}
              sub={`${filteredTrips.length} trips`} />
            <StatCard label="Tips + Bonuses" value={money(totalTips)}
              sub="extra income" color="green" />
            <StatCard label="Platform Fees" value={money(totalFees)}
              color="red" sub="paid to platform" />
            <StatCard label="Net Earnings" value={money(totalNet)}
              color="green" sub="after fees" />
            <StatCard label="Total Expenses" value={money(totalExpenses)}
              color="red" sub="fuel, repairs, etc" />
            <StatCard label="Net Profit" value={money(profit)}
              color={profit >= 0 ? 'green' : 'red'}
              sub="after all costs" />
            <StatCard label="Avg per Trip" value={money(avgPerTrip)} color="accent" />
            <StatCard label="Avg per Hour" value={avgPerHour > 0 ? money(avgPerHour) : '—'}
              sub={totalMins > 0 ? `${Math.round(totalMins / 60)}h logged` : 'No duration data'}
              color="accent" />
          </div>

          {/* Charts */}
          <SectionLabel>Charts</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2 bg-white border border-border rounded-card shadow-sm p-5">
              <p className="text-sm font-bold text-[#18222f] mb-1">Monthly Earnings vs Expenses</p>
              <p className="text-xs text-faint mb-4">Net earnings · Expenses · Profit line</p>
              <div className="relative h-56">
                <EarningsChart trips={filteredTrips} expenses={filteredExpenses} />
              </div>
            </div>

            <div className="bg-white border border-border rounded-card shadow-sm p-5">
              <p className="text-sm font-bold text-[#18222f] mb-1">By Platform</p>
              <p className="text-xs text-faint mb-4">Net earnings split</p>
              <div className="relative h-56">
                <PlatformChart trips={filteredTrips} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
