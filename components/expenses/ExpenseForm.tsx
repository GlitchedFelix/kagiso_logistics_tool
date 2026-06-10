'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { todayISO } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ExpenseFormProps {
  onSaved: () => void
  onCancel: () => void
}

const CATEGORIES = ['Fuel', 'Service', 'Car Wash', 'Insurance', 'Data', 'Tolls', 'Other']

export default function ExpenseForm({ onSaved, onCancel }: ExpenseFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    expense_date: todayISO(),
    category: 'Fuel',
    amount: '',
    description: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!form.expense_date || !amount) {
      toast.error('Date and amount are required')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('expenses').insert([{
      user_id:      user!.id,
      expense_date: form.expense_date,
      category:     form.category,
      amount,
      description:  form.description || null,
    }])

    setLoading(false)

    if (error) { toast.error('Failed to save expense'); return }

    toast.success('Expense saved!')
    setForm({ expense_date: todayISO(), category: 'Fuel', amount: '', description: '' })
    onSaved()
  }

  const inputCls = `w-full px-3 py-2.5 text-sm border border-[#d6dce5] rounded-sm outline-none
                    focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all bg-white`

  return (
    <div className="border border-border rounded-lg p-4 bg-surface2 mb-4">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">Date</label>
            <input type="date" value={form.expense_date}
              onChange={e => set('expense_date', e.target.value)} required className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className={inputCls}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">Amount (R)</label>
            <input type="number" min="0" step="0.01" value={form.amount}
              onChange={e => set('amount', e.target.value)}
              placeholder="0.00" required className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">Description</label>
            <input type="text" value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Optional" className={inputCls} />
          </div>
          <div className="col-span-2 md:col-span-4 flex gap-2 justify-end pt-1">
            <button type="button" onClick={onCancel}
              className="px-4 py-2 text-sm font-semibold text-dim border border-border rounded-sm
                         hover:border-[#b0b8c4] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 bg-green hover:bg-green/90 text-white text-sm font-semibold
                         rounded-sm transition-colors disabled:opacity-60">
              {loading ? 'Saving…' : 'Save Expense'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
