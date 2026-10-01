import type { Control, DemoProps } from '@kit/lib/demo'
import RollText from './RollText'

export const controls: Control[] = [
  { name: 'text', label: 'Text', type: 'text', default: 'Open project →' },
  { name: 'stagger', label: 'Letter stagger (ms)', type: 'range', min: 0, max: 40, step: 2, default: 12 },
]

export default function Demo({ values }: DemoProps) {
  const text = String(values.text)
  const stagger = Number(values.stagger)
  return (
    <div className="flex min-h-[320px] flex-wrap items-center justify-center gap-4 p-10">
      <a href="#" onClick={e => e.preventDefault()} className="group text-title">
        <RollText text={text} stagger={stagger} />
      </a>
      <button className="group rounded-full border border-ink px-5 py-2 text-[14px] font-medium uppercase tracking-[0.04em] transition-colors hover:bg-accent">
        <RollText text="About me" stagger={stagger} />
      </button>
      <p className="caption w-full text-center text-muted">Hover the link or the pill</p>
    </div>
  )
}
