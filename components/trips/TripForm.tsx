'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { todayISO, netEarnings, money } from '@/lib/utils'
import toast from 'react-hot-toast'

interface TripFormProps {
  onSaved: () => void
}

const PLATFORMS = ['Uber', 'Bolt', 'InDrive', 'Other']

export default function TripForm({ onSaved }: TripFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    trip_date: todayISO(),
    platform: 'Uber',
    earnings: '',
    tip: '',
    bonus: '',
    platform_fee: '',
    duration_minutes: '',
    distance_km: '',
    trip_ref: '',
    notes: '',
  })

  const net = netEarnings({
    earnings:     Number(form.earnings)     || 0,
    tip:          Number(form.tip)          || 0,
    bonus:        Number(form.bonus)        || 0,
    platform_fee: Number(form.platform_fee) || 0,
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const earnings = Number(form.earnings)
    if (!form.trip_date || !earnings) {
      toast.error('Date and gross earnings are required')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('trips').insert([{
      user_id:          user!.id,
      trip_date:        form.trip_date,
      platform:         form.platform,
      earnings:         earnings,
      tip:              Number(form.tip)           || 0,
      bonus:            Number(form.bonus)         || 0,
      platform_fee:     Number(form.platform_fee)  || 0,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      distance_km:      form.distance_km ? Number(form.distance_km) : null,
      trip_ref:         form.trip_ref || null,
      notes:            form.notes || null,
    }])

    setLoading(false)

    if (error) {
      toast.error('Failed to save trip: ' + error.message)
      return
    }

    toast.success(`Trip saved! Net: ${money(net)}`)
    setForm({
      trip_date: todayISO(),
      platform: 'Uber',
      earnings: '',
      tip: '',
      bonus: '',
      platform_fee: '',
      duration_minutes: '',
      distance_km: '',
      trip_ref: '',
      notes: '',
    })
    onSaved()
  }

  const inputCls = `w-full px-3 py-2.5 text-sm border border-[#d6dce5] rounded-sm outline-none
                    focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all bg-white`
  const labelCls = `block text-xs font-medium text-dim mb-1.5`

  return (
    <div className="bg-white border border-border rounded-card shadow-sm p-6">
      <h2 className="text-base font-bold text-[#18222f] mb-1">Log a Trip</h2>
      <p className="text-xs text-dim mb-5">Enter your earnings from the platform app</p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

          <div>
            <label className={labelCls}>Date *</label>
            <input type="date" value={form.trip_date}
              onChange={e => set('trip_date', e.target.value)} required className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Platform *</label>
            <select value={form.platform} onChange={e => set('platform', e.target.value)}
              className={inputCls}>
              {PLATFORMS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Trip Ref / ID</label>
            <input type="text" value={form.trip_ref} onChange={e => set('trip_ref', e.target.value)}
              placeholder="Optional" className={inputCls} />
          </div>

          {/* Earnings section */}
          <div className="col-span-2 md:col-span-3">
            <hr className="border-border mb-4" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-faint mb-3">
              Earnings Breakdown
            </p>
          </div>

          <div>
            <label className={labelCls}>Gross Earnings (R) *</label>
            <input type="number" min="0" step="0.01" value={form.earnings}
              onChange={e => set('earnings', e.target.value)}
              placeholder="0.00" required className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Tip (R)</label>
            <input type="number" min="0" step="0.01" value={form.tip}
              onChange={e => set('tip', e.target.value)}
              placeholder="0.00" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Bonus (R)</label>
            <input type="number" min="0" step="0.01" value={form.bonus}
              onChange={e => set('bonus', e.target.value)}
              placeholder="0.00" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Platform Fee (R)</label>
            <input type="number" min="0" step="0.01" value={form.platform_fee}
              onChange={e => set('platform_fee', e.target.value)}
              placeholder="0.00" className={inputCls} />
            <p className="text-[10px] text-faint mt-1">Deducted from your gross</p>
          </div>

          {/* Net preview */}
          <div>
            <label className={labelCls}>Net Earnings (auto)</label>
            <div className={`px-3 py-2.5 text-sm rounded-sm border font-semibold tabular
                             ${net >= 0
                               ? 'bg-green/10 border-green/20 text-green'
                               : 'bg-red/10 border-red/20 text-red'}`}>
              {money(net)}
            </div>
          </div>

          {/* Trip details */}
          <div className="col-span-2 md:col-span-3">
            <hr className="border-border mb-4" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-faint mb-3">
              Trip Details (Optional)
            </p>
          </div>

          <div>
            <label className={labelCls}>Duration (mins)</label>
            <input type="number" min="0" step="1" value={form.duration_minutes}
              onChange={e => set('duration_minutes', e.target.value)}
              placeholder="e.g. 45" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Distance (km)</label>
            <input type="number" min="0" step="0.1" value={form.distance_km}
              onChange={e => set('distance_km', e.target.value)}
              placeholder="e.g. 12.5" className={inputCls} />
          </div>

          <div className="col-span-2 md:col-span-3">
            <label className={labelCls}>Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              rows={2} placeholder="Optional notes…"
              className={inputCls + ' resize-none'} />
          </div>

          <div className="col-span-2 md:col-span-3 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, earnings: '', tip: '', bonus: '', platform_fee: '' }))}
              className="px-4 py-2 text-sm font-semibold text-dim border border-border rounded-sm
                         hover:border-[#b0b8c4] transition-colors"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green hover:bg-green/90 text-white text-sm font-semibold
                         rounded-sm transition-colors disabled:opacity-60"
            >
              {loading ? 'Saving…' : '✓ Save Trip'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
