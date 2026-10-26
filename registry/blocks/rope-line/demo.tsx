import type { Control, DemoProps } from '@kit/lib/demo'
import RopeLine from './RopeLine'

export const controls: Control[] = [
  { name: 'length', label: 'Length (× height)', type: 'range', min: 0.6, max: 3, step: 0.1, default: 1.6 },
  { name: 'gravity', label: 'Gravity', type: 'range', min: 0, max: 1, step: 0.05, default: 0.35 },
  { name: 'follow', label: 'Follow', type: 'range', min: 0.05, max: 1, step: 0.05, default: 0.35 },
  { name: 'width', label: 'Stroke (px)', type: 'range', min: 0.5, max: 4, step: 0.5, default: 1 },
]

export default function Demo({ values }: DemoProps) {
  return (
    <RopeLine
      length={Number(values.length)}
      gravity={Number(values.gravity)}
      follow={Number(values.follow)}
      width={Number(values.width)}
      anchor={[0.22, 0]}
      className="min-h-[560px] cursor-crosshair text-ink"
    >
      <div className="flex min-h-[560px] flex-col justify-between p-6 md:p-12">
        <div className="caption flex items-center justify-between gap-4">
          <span>Home</span>
          <span className="flex items-center gap-2">
            <span className="size-2 bg-accent" /> 24 people here
          </span>
          <span className="rounded-kit border border-current px-3 py-1">Lost? Start here</span>
        </div>
        <h2 className="max-w-[12ch] font-display text-display uppercase">The space between the lines</h2>
        <div className="flex items-end justify-between gap-6">
          <p className="text-lead max-w-[22ch]">Online connected. Offline alone.</p>
          <p className="caption">Move the pointer to drag the thread</p>
        </div>
      </div>
    </RopeLine>
  )
}
