import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import StickerTrail from './StickerTrail'

export const controls: Control[] = [
  { name: 'count', label: 'Copies', type: 'range', min: 1, max: 48, step: 1, default: 24 },
  { name: 'follow', label: 'Follow', type: 'range', min: 0.1, max: 0.8, step: 0.05, default: 0.35 },
  { name: 'size', label: 'Size', type: 'range', min: 40, max: 160, step: 4, default: 88 },
  { name: 'fade', label: 'Last copy opacity', type: 'range', min: 0, max: 1, step: 0.05, default: 0.25 },
]

const cells = ['bg-accent', 'bg-mist', 'bg-paper', 'bg-ink text-paper']

export default function Demo({ values }: DemoProps) {
  return (
    <StickerTrail
      key={Number(values.count)}
      count={Number(values.count)}
      follow={Number(values.follow)}
      size={Number(values.size)}
      fade={Number(values.fade)}
      className="cursor-crosshair"
    >
      <div className="grid min-h-[560px] grid-cols-1 md:grid-cols-2">
        {demoProjects.map((p, i) => (
          <div key={p.id} className={`flex flex-col justify-between gap-8 p-6 ${cells[i % cells.length]}`}>
            <h3 className="font-display text-headline">{p.title}</h3>
            <div className="flex items-end justify-between gap-4">
              <p className="text-lead max-w-[18ch]">{p.category}</p>
              <span className="caption rounded-full border border-current px-3 py-1.5">{p.year}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="caption pointer-events-none absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper px-3 py-1.5 text-ink md:block">
        Move fast · click to swap the sticker
      </p>
    </StickerTrail>
  )
}
