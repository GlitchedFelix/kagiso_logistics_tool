'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { money, sum, num } from '@/lib/utils'
import PageHeader from '@/components/ui/PageHeader'
import ExpenseForm from '@/components/expenses/ExpenseForm'
import ExpenseTable from '@/components/expenses/ExpenseTable'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

interface Expense {
  id: string
  expense_date: string
  category: string
  amount: number
  description: string | null
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false })
    setExpenses(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function exportExcel() {
    if (!expenses.length) { toast.error('No expenses to export'); return }

    const rows = expenses.map(e => ({
      Date: e.expense_date,
      Category: e.category,
      'Amount (R)': Number(e.amount),
      Description: e.description ?? '',
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses')
    XLSX.writeFile(wb, `driveledger-expenses-${new Date().toISOString().slice(0, 10)}.xlsx`)
    toast.success(`Exported ${expenses.length} expenses`)
  }

  const total = sum(expenses, e => num(e.amount))

  // Category breakdown
  const categories = [...new Set(expenses.map(e => e.category))]
  const catTotals = categories.map(c => ({
    cat: c,
    total: sum(expenses.filter(e => e.category === c), e => num(e.amount)),
  })).sort((a, b) => b.total - a.total)

  return (
    <div>
      <PageHeader
        title="Expenses"
        description={loading ? '' : `${expenses.length} expenses · Total: ${money(total)}`}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(f => !f)}
              className="px-4 py-2 text-sm font-semibold bg-accent text-white rounded-sm
                         hover:bg-accent-dark transition-colors"
            >
              {showForm ? 'Cancel' : '+ Add Expense'}
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
        <ExpenseForm
          onSaved={() => { load(); setShowForm(false) }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Category summary pills */}
      {catTotals.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {catTotals.map(({ cat, total: t }) => (
            <span key={cat}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-border
                         rounded-full text-xs font-medium text-dim shadow-sm">
              {cat}
              <span className="font-bold text-red">{money(t)}</span>
            </span>
          ))}
        </div>
      )}

      <div className="bg-white border border-border rounded-card shadow-sm">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#18222f]">All Expenses</h2>
          <span className="text-xs text-dim">{expenses.length} record{expenses.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-12 text-dim text-sm">Loading…</div>
          ) : (
            <ExpenseTable expenses={expenses} onChanged={load} />
          )}
        </div>
      </div>
    </div>
  )
}
