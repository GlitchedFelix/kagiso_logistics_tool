'use client'

import { useEffect, useRef } from 'react'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'
import { num, round2 } from '@/lib/utils'

Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

interface Trip {
  platform: string
  earnings: number
  tip: number
  bonus: number
  platform_fee: number
}

export default function PlatformChart({ trips }: { trips: Trip[] }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!ref.current) return

    const map: Record<string, number> = {}
    trips.forEach(t => {
      const net = round2(num(t.earnings) + num(t.tip) + num(t.bonus) - num(t.platform_fee))
      map[t.platform] = (map[t.platform] || 0) + net
    })

    const labels = Object.keys(map)
    const data = labels.map(l => round2(map[l]))
    const colors = ['rgba(59,108,246,.85)', 'rgba(22,160,106,.85)', 'rgba(224,151,43,.9)', 'rgba(124,92,252,.85)']

    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(ref.current, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: '#fff',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '58%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.label}: R ${Number(ctx.parsed).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
            },
          },
        },
      },
    })

    return () => { chartRef.current?.destroy() }
  }, [trips])

  if (!trips.length) {
    return (
      <div className="flex items-center justify-center h-40 text-faint text-sm">
        No trips yet
      </div>
    )
  }

  return <canvas ref={ref} />
}
