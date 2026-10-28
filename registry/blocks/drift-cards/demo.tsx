import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import DriftCards from './DriftCards'

export const controls: Control[] = [
  { name: 'drift', label: 'Drift (px)', type: 'range', min: 0, max: 30, step: 1, default: 7 },
  { name: 'objects', label: 'Floating objects', type: 'toggle', default: true },
]

export default function Demo({ values }: DemoProps) {
  const items = demoProjects.map(p => ({
    id: p.id,
    title: p.title,
    kind: p.category.split(',')[0],
    note: `${p.category} · ${p.year}`,
    image: p.image,
    object: values.objects ? p.cards[1] : undefined,
  }))
  return (
    <div className="border-t-2 border-ink lg:h-[720px]">
      <DriftCards items={items} drift={Number(values.drift)} />
    </div>
  )
}
