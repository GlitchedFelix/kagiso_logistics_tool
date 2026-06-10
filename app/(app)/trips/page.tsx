'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { money, sum, netEarnings } from '@/lib/utils'
import PageHeader from '@/components/ui/PageHeader'
import TripForm from '@/components/trips/TripForm'
import TripTable from '@/components/trips/TripTable'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

interface Trip {
  id: string
  trip_date: string
  platform: string
  earnings: number
  tip: number
  bonus: number
  platform_fee: number
  duration_minutes: number | null
  distance_km: number | null
  trip_ref: string | null
  notes: string | null
}

export default function TripsPage() {
  const [trips, setTrips]     = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('trips')
      .select('*')
      .order('trip_date', { ascending: false })
    setTrips(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function exportExcel() {
    if (!trips.length) { toast.error('No trips to export'); return }

    const rows = trips.map(t => ({
      Date: t.trip_date,
      Platform: t.platform,
      'Gross (R)': Number(t.earnings),
      'Tip (R)': Number(t.tip),
      'Bonus (R)': Number(t.bonus),
      'Fee (R)': Number(t.platform_fee),
      'Net (R)': netEarnings(t),
      'Duration (min)': t.duration_minutes ?? '',
      'Distance (km)': t.distance_km ?? '',
      'Trip Ref': t.trip_ref ?? '',
      Notes: t.notes ?? '',
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = Object.keys(rows[0]).map(k => ({
      wch: Math.max(k.length + 2, ...rows.map(r => String(r[k as keyof typeof r] ?? '').length + 2))
    }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Trips')
    XLSX.writeFile(wb, `driveledger-trips-${new Date().toISOString().slice(0, 10)}.xlsx`)
    toast.success(`Exported ${trips.length} trips`)
  }

  const totalNet = sum(trips, t => netEarnings(t))

  return (
    <div>
      <PageHeader
        title="Trips"
        description={loading ? '' : `${trips.length} trips · Net total: ${money(totalNet)}`}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(f => !f)}
              className="px-4 py-2 text-sm font-semibold text-dim border border-border rounded-sm
                         hover:border-[#b0b8c4] transition-colors"
            >
              {showForm ? 'Hide Form' : '+ Log Trip'}
            </button>
            <button
              onClick={exportExcel}
              className="px-4 py-2 text-sm font-semibold text-accent border border-accent/30 rounded-sm
                         hover:bg-accent-soft transition-colors"
            >
              ↓ Export
            </button>
          </div>
        }
      />

      {showForm && (
        <div className="mb-6">
          <TripForm onSaved={load} />
        </div>
      )}

      <div className="bg-white border border-border rounded-card shadow-sm">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#18222f]">All Trips</h2>
          <span className="text-xs text-dim">{trips.length} record{trips.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-12 text-dim text-sm">Loading…</div>
          ) : (
            <TripTable trips={trips} onChanged={load} />
          )}
        </div>
      </div>
    </div>
  )
}
