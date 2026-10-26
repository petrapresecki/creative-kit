import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import IdlePixelate from './IdlePixelate'

export const controls: Control[] = [
  { name: 'block', label: 'Block (px)', type: 'range', min: 6, max: 48, step: 2, default: 18 },
  { name: 'idle', label: 'Back to pixels after (ms)', type: 'range', min: 0, max: 2000, step: 100, default: 700 },
  { name: 'tag', label: 'Tag', type: 'text', default: '@studio' },
]

export default function Demo({ values }: DemoProps) {
  return (
    <div className="grid min-h-[520px] content-center gap-6 px-6 py-12 md:grid-cols-3 md:px-12">
      {demoProjects.slice(0, 3).map(p => (
        <figure key={p.id} className="grid gap-3">
          <IdlePixelate
            src={p.image}
            alt={p.title}
            block={Number(values.block)}
            idle={Number(values.idle)}
            tag={String(values.tag)}
            box={[0.25, 0.2, 0.5, 0.45]}
          />
          <figcaption className="caption flex justify-between">
            <span>{p.title}</span>
            <span>{p.year}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
