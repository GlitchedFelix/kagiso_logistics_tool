'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { money, netEarnings, num } from '@/lib/utils'
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

interface TripTableProps {
  trips: Trip[]
  onChanged: () => void
}

const PLATFORMS = ['Uber', 'Bolt', 'InDrive', 'Other']

export default function TripTable({ trips, onChanged }: TripTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function updateField(id: string, field: string, value: string | number) {
    const supabase = createClient()
    const { error } = await supabase.from('trips').update({ [field]: value }).eq('id', id)
    if (error) { toast.error('Update failed'); return }
    toast.success('Saved')
    onChanged()
  }

  async function deleteTrip(id: string) {
    if (!confirm('Delete this trip?')) return
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('trips').delete().eq('id', id)
    setDeletingId(null)
    if (error) { toast.error('Delete failed'); return }
    toast.success('Trip deleted')
    onChanged()
  }

  if (!trips.length) {
    return (
      <div className="text-center py-16 text-faint">
        <div className="text-4xl mb-3">🚗</div>
        <p className="text-sm">No trips yet. Log your first trip above.</p>
      </div>
    )
  }

  const cellCls = `px-3 py-2 text-sm border-b border-border`
  const inputCls = `bg-transparent border border-transparent px-1.5 py-1 rounded text-sm
                    w-full min-w-[60px] hover:border-border focus:border-accent
                    focus:bg-white focus:ring-1 focus:ring-accent/20 outline-none transition-all`

  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="bg-surface2 text-left">
            {['Date', 'Platform', 'Gross', 'Tip', 'Bonus', 'Fee', 'Net', 'Km', 'Ref', ''].map(h => (
              <th key={h} className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide
                                     text-dim border-b border-border whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trips.map(trip => {
            const net = netEarnings(trip)
            return (
              <tr key={trip.id} className="hover:bg-surface2 transition-colors">
                <td className={cellCls}>
                  <input type="date" defaultValue={trip.trip_date}
                    onBlur={e => updateField(trip.id, 'trip_date', e.target.value)}
                    className={inputCls} />
                </td>
                <td className={cellCls}>
                  <select defaultValue={trip.platform}
                    onChange={e => updateField(trip.id, 'platform', e.target.value)}
                    className={inputCls + ' cursor-pointer'}>
                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </td>
                <td className={cellCls}>
                  <input type="number" min="0" step="0.01" defaultValue={num(trip.earnings)}
                    onBlur={e => updateField(trip.id, 'earnings', Number(e.target.value))}
                    className={inputCls} />
                </td>
                <td className={cellCls}>
                  <input type="number" min="0" step="0.01" defaultValue={num(trip.tip)}
                    onBlur={e => updateField(trip.id, 'tip', Number(e.target.value))}
                    className={inputCls} />
                </td>
                <td className={cellCls}>
                  <input type="number" min="0" step="0.01" defaultValue={num(trip.bonus)}
                    onBlur={e => updateField(trip.id, 'bonus', Number(e.target.value))}
                    className={inputCls} />
                </td>
                <td className={cellCls}>
                  <input type="number" min="0" step="0.01" defaultValue={num(trip.platform_fee)}
                    onBlur={e => updateField(trip.id, 'platform_fee', Number(e.target.value))}
                    className={inputCls} />
                </td>
                <td className={`${cellCls} font-semibold tabular whitespace-nowrap
                                ${net >= 0 ? 'text-green' : 'text-red'}`}>
                  {money(net)}
                </td>
                <td className={cellCls}>
                  <input type="number" min="0" step="0.1"
                    defaultValue={trip.distance_km ?? ''}
                    onBlur={e => updateField(trip.id, 'distance_km', Number(e.target.value))}
                    placeholder="—" className={inputCls} />
                </td>
                <td className={cellCls}>
                  <input type="text" defaultValue={trip.trip_ref ?? ''}
                    onBlur={e => updateField(trip.id, 'trip_ref', e.target.value)}
                    placeholder="—" className={inputCls} />
                </td>
                <td className={cellCls}>
                  <button
                    onClick={() => deleteTrip(trip.id)}
                    disabled={deletingId === trip.id}
                    className="px-2.5 py-1 text-xs font-semibold text-red border border-red/30
                               rounded hover:bg-red hover:text-white transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
