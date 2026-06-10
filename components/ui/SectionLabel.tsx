export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-faint mb-3">
      {children}
    </p>
  )
}
