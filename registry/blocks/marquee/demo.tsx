import type { Control, DemoProps } from '@kit/lib/demo'
import Marquee from './Marquee'

export const controls: Control[] = [
  { name: 'text', label: 'Text', type: 'text', default: 'Selected Work ✺ 2025—26 ✺' },
  { name: 'duration', label: 'Seconds per loop', type: 'range', min: 6, max: 60, step: 2, default: 24 },
  { name: 'reverse', label: 'Reverse', type: 'toggle', default: false },
]

export default function Demo({ values }: DemoProps) {
  const duration = Number(values.duration)
  return (
    <div className="flex min-h-[360px] flex-col justify-center gap-6 overflow-hidden py-10">
      <Marquee duration={duration} reverse={Boolean(values.reverse)}>
        <span className="pr-[0.4em] font-display text-display whitespace-nowrap">{String(values.text)}</span>
      </Marquee>
      <Marquee duration={duration / 2} reverse={!values.reverse} className="bg-accent py-1">
        {['Branding', 'Packaging', 'Motion', '3D', 'Editorial'].map(w => (
          <span key={w} className="caption pr-8 text-[13px]">
            {w} ✺
          </span>
        ))}
      </Marquee>
    </div>
  )
}
