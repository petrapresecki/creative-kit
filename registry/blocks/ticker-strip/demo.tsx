import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import TickerStrip from './TickerStrip'

const COLORS: Record<string, string> = {
  'ticker blue': '#2b2bff',
  ink: 'var(--color-ink)',
  accent: 'var(--color-accent)',
}

export const controls: Control[] = [
  { name: 'text', label: 'Text', type: 'text', default: `now showing ${demoProjects[0].title} ♡ project 1 of 4 ♡ branding, 2026 ♡ made by hand` },
  { name: 'duration', label: 'Seconds per loop', type: 'range', min: 10, max: 90, step: 2, default: 40 },
  { name: 'color', label: 'Strip', type: 'select', options: Object.keys(COLORS), default: 'ticker blue' },
]

export default function Demo({ values }: DemoProps) {
  return (
    <div className="flex min-h-[320px] flex-col justify-between bg-mist">
      <p className="m-0 max-w-[40ch] px-6 pt-12 font-mono text-lead md:px-12">
        A strip along the foot of the page saying what is on. Hover it to stop it.
      </p>
      <TickerStrip text={String(values.text)} duration={Number(values.duration)} color={COLORS[String(values.color)]} />
    </div>
  )
}
