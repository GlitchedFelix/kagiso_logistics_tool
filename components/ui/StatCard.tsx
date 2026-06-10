interface StatCardProps {
  label: string
  value: string
  sub?: string
  color?: 'default' | 'green' | 'red' | 'accent' | 'amber'
}

const colorMap = {
  default: 'text-[#18222f]',
  green:   'text-green',
  red:     'text-red',
  accent:  'text-accent',
  amber:   'text-amber',
}

export default function StatCard({ label, value, sub, color = 'default' }: StatCardProps) {
  return (
    <div className="bg-white border border-border rounded-card shadow-sm p-4
                    hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
      <p className="text-xs font-medium text-dim mb-2">{label}</p>
      <p className={`text-2xl font-bold leading-tight tracking-tight tabular ${colorMap[color]}`}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-faint mt-1.5">{sub}</p>}
    </div>
  )
}
