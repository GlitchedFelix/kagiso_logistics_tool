'use client'

import { useEffect, useRef } from 'react'
import {
  Chart,
  BarElement,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  BarController,
  LineController,
} from 'chart.js'
import { monthLabel, num, round2 } from '@/lib/utils'

Chart.register(
  BarElement, LineElement, PointElement,
  LinearScale, CategoryScale,
  Tooltip, Legend,
  BarController, LineController
)

interface Trip {
  trip_date: string
  earnings: number
  tip: number
  bonus: number
  platform_fee: number
}

interface Expense {
  expense_date: string
  amount: number
}

interface EarningsChartProps {
  trips: Trip[]
  expenses: Expense[]
}

export default function EarningsChart({ trips, expenses }: EarningsChartProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!ref.current) return

    const monthMap: Record<string, { net: number; expenses: number }> = {}

    trips.forEach(t => {
      const k = (t.trip_date || '').slice(0, 7)
      if (!k) return
      monthMap[k] ||= { net: 0, expenses: 0 }
      monthMap[k].net += round2(
        num(t.earnings) + num(t.tip) + num(t.bonus) - num(t.platform_fee)
      )
    })

    expenses.forEach(e => {
      const k = (e.expense_date || '').slice(0, 7)
      if (!k) return
      monthMap[k] ||= { net: 0, expenses: 0 }
      monthMap[k].expenses += num(e.amount)
    })

    const labels = Object.keys(monthMap).sort()
    const netData = labels.map(l => round2(monthMap[l].net))
    const expData = labels.map(l => round2(monthMap[l].expenses))
    const profitData = labels.map((l, i) => round2(netData[i] - expData[i]))

    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(ref.current, {
      data: {
        labels: labels.map(monthLabel),
        datasets: [
          {
            type: 'bar',
            label: 'Net Earnings',
            data: netData,
            backgroundColor: 'rgba(22,160,106,.8)',
            borderRadius: 4,
            order: 2,
          },
          {
            type: 'bar',
            label: 'Expenses',
            data: expData,
            backgroundColor: 'rgba(229,96,75,.75)',
            borderRadius: 4,
            order: 2,
          },
          {
            type: 'line',
            label: 'Profit',
            data: profitData,
            borderColor: '#3b6cf6',
            backgroundColor: '#3b6cf6',
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 3,
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: R ${Number(ctx.parsed.y).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
            },
          },
        },
        scales: {
          x: { grid: { color: '#eef2f7' } },
          y: {
            beginAtZero: true,
            grid: { color: '#eef2f7' },
            ticks: {
              callback: v => 'R ' + Number(v).toLocaleString('en-ZA'),
            },
          },
        },
      },
    })

    return () => { chartRef.current?.destroy() }
  }, [trips, expenses])

  if (!trips.length && !expenses.length) {
    return (
      <div className="flex items-center justify-center h-52 text-faint text-sm">
        Add trips to see your earnings chart
      </div>
    )
  }

  return <canvas ref={ref} />
}
