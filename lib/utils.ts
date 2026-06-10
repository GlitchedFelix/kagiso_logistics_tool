export function money(value: number | string | null | undefined): string {
  const n = Number(value) || 0
  return 'R ' + n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function round2(v: number | string | null | undefined): number {
  return +(Number(v) || 0).toFixed(2)
}

export function num(v: unknown): number {
  return Number(v) || 0
}

export function sum<T>(arr: T[], fn: (item: T) => number): number {
  return arr.reduce((s, x) => s + num(fn(x)), 0)
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function monthLabel(key: string): string {
  if (!key || key.length < 7) return key || '—'
  const [y, m] = key.split('-')
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${names[(+m) - 1] || m} '${y.slice(2)}`
}

export function currentMonthKey(): string {
  return new Date().toISOString().slice(0, 7)
}

export function netEarnings(trip: {
  earnings: number
  tip: number
  bonus: number
  platform_fee: number
}): number {
  return round2(
    num(trip.earnings) + num(trip.tip) + num(trip.bonus) - num(trip.platform_fee)
  )
}
