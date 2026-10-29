import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import WordGapIndex from './WordGapIndex'

export const controls: Control[] = [
  { name: 'shuffle', label: 'Shuffle letters', type: 'toggle', default: true },
  { name: 'pixel', label: 'Start pixel (px)', type: 'range', min: 0, max: 32, step: 2, default: 14 },
]

const titles = ['Lightship', 'Wolverine Worldwide', 'The Drake Hotel', 'Dulcedo', 'Scout Motors']

export default function Demo({ values }: DemoProps) {
  const items = titles.map((title, i) => ({ id: String(i), title, image: demoProjects[i % demoProjects.length].image }))
  return (
    <div className="px-6 py-12 md:px-10">
      <p className="mb-3 text-body">Featured work</p>
      <WordGapIndex items={items} shuffle={Boolean(values.shuffle)} pixel={Number(values.pixel)} />
    </div>
  )
}
