import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import onyx from '@themes/onyx.json'
import ShapeIndex, { type ShapeItem } from './ShapeIndex'

export const controls: Control[] = [
  { name: 'float', label: 'Float (px)', type: 'range', min: 0, max: 30, step: 1, default: 10 },
  { name: 'colours', label: 'Colour per project', type: 'toggle', default: true },
]

// Sample silhouettes. In a real site each project gets a shape drawn for it.
const poly = (pts: number[][]) => `M${pts.map(p => p.join(' ')).join('L')}Z`

/** n bars crossing at the centre of a 100×100 box */
const asterisk = (n = 4, half = 50, t = 11) =>
  Array.from({ length: n }, (_, k) => {
    const a = (k * Math.PI) / n
    const [c, s] = [Math.cos(a), Math.sin(a)]
    const pt = (x: number, y: number) => [50 + x * c - y * s, 50 + x * s + y * c].map(v => +v.toFixed(2))
    return poly([pt(-half, -t), pt(half, -t), pt(half, t), pt(-half, t)])
  }).join('')

const stairs = poly([[0, 100], [0, 80], [20, 80], [20, 60], [40, 60], [40, 40], [60, 40], [60, 20], [80, 20], [80, 0], [120, 0], [120, 100]])
const arch = 'M0 110V55a50 50 0 0 1 100 0v55Z M40 10a10 10 0 1 1 20 0v8H40Z'
const zigzag = poly([[0, 10], [30, 70], [55, 20], [80, 70], [105, 20], [140, 80], [140, 50], [105, 0], [80, 45], [55, 0], [30, 45], [0, 0]].map(([x, y]) => [x, y]))
const circle = 'M50 0a50 50 0 1 1 0 100a50 50 0 1 1 0-100Z'
const pill = 'M30 0h40a30 30 0 0 1 0 60H30a30 30 0 0 1 0-60Z'

const layout: Pick<ShapeItem, 'shape' | 'viewBox' | 'x' | 'y' | 'w'>[] = [
  { shape: circle, viewBox: '0 0 100 100', x: 5, y: 2, w: 17 },
  { shape: stairs, viewBox: '0 0 120 100', x: 15, y: 38, w: 27 },
  { shape: arch, viewBox: '0 0 100 110', x: 36, y: 0, w: 19 },
  { shape: asterisk(), viewBox: '0 0 100 100', x: 50, y: 36, w: 22 },
  { shape: zigzag, viewBox: '0 0 140 80', x: 64, y: 0, w: 30 },
  { shape: pill, viewBox: '0 0 100 60', x: 74, y: 56, w: 21 },
]

const colours = onyx.palette.slice(1).map(p => p.value)

const sources = [
  ...demoProjects.map(p => ({ id: p.id, title: p.title, image: p.image })),
  { id: 'rool-posters', title: 'Rool Posters', image: demoProjects[0].cards[3] },
  { id: 'booklet-spreads', title: 'Booklet Spreads', image: demoProjects[2].cards[2] },
]

export default function Demo({ values }: DemoProps) {
  const items: ShapeItem[] = sources.map((s, i) => ({ ...s, ...layout[i], color: values.colours ? colours[i % colours.length] : undefined }))
  return (
    <div className="flex min-h-[640px] flex-col bg-paper px-3 py-8 text-ink md:h-[760px] md:px-4">
      <ShapeIndex items={items} float={Number(values.float)} className="flex-1" />
    </div>
  )
}
