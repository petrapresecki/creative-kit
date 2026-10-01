import type { Control, DemoValues } from '@kit/lib/demo'

interface ControlsProps {
  controls: Control[]
  values: DemoValues
  onChange: (name: string, value: string | number | boolean) => void
  onReset: () => void
}

export default function Controls({ controls, values, onChange, onReset }: ControlsProps) {
  if (!controls.length) return <p className="caption text-muted">This block has no settings to play with.</p>
  return (
    <div className="grid gap-5">
      {controls.map(c => {
        const id = `ctl-${c.name}`
        const value = values[c.name]
        return (
          <div key={c.name} className="grid gap-2">
            <label htmlFor={id} className="caption flex justify-between gap-4 text-muted">
              <span>{c.label}</span>
              {c.type === 'range' && <span className="text-ink tabular-nums">{String(value)}</span>}
            </label>
            {c.type === 'range' && (
              <input id={id} type="range" min={c.min} max={c.max} step={c.step} value={Number(value)} onChange={e => onChange(c.name, Number(e.target.value))} className="accent-[var(--color-ink)]" />
            )}
            {c.type === 'select' && (
              <select id={id} value={String(value)} onChange={e => onChange(c.name, e.target.value)} className="rounded-full border border-ink/20 bg-paper px-3 py-1.5 text-[14px]">
                {c.options.map(o => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            )}
            {c.type === 'toggle' && (
              <button
                id={id}
                role="switch"
                aria-checked={Boolean(value)}
                onClick={() => onChange(c.name, !value)}
                className={`flex h-7 w-12 items-center rounded-full border border-ink p-0.5 transition-colors ${value ? 'bg-accent' : 'bg-paper'}`}
              >
                <span className={`size-5 rounded-full bg-ink transition-transform duration-300 ease-out-expo ${value ? 'translate-x-5' : ''}`} />
              </button>
            )}
            {c.type === 'text' && (
              <textarea id={id} rows={2} value={String(value)} onChange={e => onChange(c.name, e.target.value)} className="resize-y border-b border-ink/20 bg-transparent py-1 text-[14px] focus:border-ink focus:outline-none" />
            )}
          </div>
        )
      })}
      <button onClick={onReset} className="caption w-fit border-b border-ink pb-0.5">
        Reset
      </button>
    </div>
  )
}
