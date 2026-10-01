interface ChipsProps<T extends string> {
  options: { value: T; label: string; count?: number }[]
  value: T
  onChange: (v: T) => void
  label: string
}

export default function Chips<T extends string>({ options, value, onChange, label }: ChipsProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1">
      {options.map(o => (
        <button
          key={o.value}
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={`rounded-full border px-3 py-1 text-[13px] font-medium whitespace-nowrap transition-colors ${
            o.value === value ? 'border-ink bg-ink text-paper' : 'border-ink/15 hover:border-ink'
          }`}
        >
          {o.label}
          {o.count !== undefined && <span className="ml-1.5 font-mono text-[10px] opacity-60">{o.count}</span>}
        </button>
      ))}
    </div>
  )
}
