'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { money } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Expense {
  id: string
  expense_date: string
  category: string
  amount: number
  description: string | null
}

interface ExpenseTableProps {
  expenses: Expense[]
  onChanged: () => void
}

const CATEGORIES = ['Fuel', 'Service', 'Car Wash', 'Insurance', 'Data', 'Tolls', 'Other']

export default function ExpenseTable({ expenses, onChanged }: ExpenseTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function updateField(id: string, field: string, value: string | number) {
    const supabase = createClient()
    const { error } = await supabase.from('expenses').update({ [field]: value }).eq('id', id)
    if (error) { toast.error('Update failed'); return }
    toast.success('Saved')
    onChanged()
  }

  async function deleteExpense(id: string) {
    if (!confirm('Delete this expense?')) return
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    setDeletingId(null)
    if (error) { toast.error('Delete failed'); return }
    toast.success('Expense deleted')
    onChanged()
  }

  if (!expenses.length) {
    return (
      <div className="text-center py-16 text-faint">
        <div className="text-4xl mb-3">💸</div>
        <p className="text-sm">No expenses yet. Add your first above.</p>
      </div>
    )
  }

  const cellCls = `px-3 py-2 text-sm border-b border-border`
  const inputCls = `bg-transparent border border-transparent px-1.5 py-1 rounded text-sm
                    w-full hover:border-border focus:border-accent focus:bg-white
                    focus:ring-1 focus:ring-accent/20 outline-none transition-all`

  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <table className="w-full">
        <thead>
          <tr className="bg-surface2 text-left">
            {['Date', 'Category', 'Amount', 'Description', ''].map(h => (
              <th key={h} className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide
                                     text-dim border-b border-border whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {expenses.map(exp => (
            <tr key={exp.id} className="hover:bg-surface2 transition-colors">
              <td className={cellCls}>
                <input type="date" defaultValue={exp.expense_date}
                  onBlur={e => updateField(exp.id, 'expense_date', e.target.value)}
                  className={inputCls} />
              </td>
              <td className={cellCls}>
                <select defaultValue={exp.category}
                  onChange={e => updateField(exp.id, 'category', e.target.value)}
                  className={inputCls + ' cursor-pointer'}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </td>
              <td className={`${cellCls} text-red font-semibold tabular`}>
                <input type="number" min="0" step="0.01" defaultValue={exp.amount}
                  onBlur={e => updateField(exp.id, 'amount', Number(e.target.value))}
                  className={inputCls + ' text-red'} />
              </td>
              <td className={cellCls}>
                <input type="text" defaultValue={exp.description ?? ''}
                  onBlur={e => updateField(exp.id, 'description', e.target.value)}
                  placeholder="—" className={inputCls} />
              </td>
              <td className={cellCls}>
                <button
                  onClick={() => deleteExpense(exp.id)}
                  disabled={deletingId === exp.id}
                  className="px-2.5 py-1 text-xs font-semibold text-red border border-red/30
                             rounded hover:bg-red hover:text-white transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-surface2">
            <td colSpan={2} className="px-3 py-2.5 text-xs font-semibold text-dim">Total</td>
            <td className="px-3 py-2.5 text-sm font-bold text-red tabular">
              {money(expenses.reduce((s, e) => s + Number(e.amount), 0))}
            </td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
