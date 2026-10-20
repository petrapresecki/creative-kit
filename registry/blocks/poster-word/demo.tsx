import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import { getTheme } from '@site/data/themes'
import PosterWord, { type Colourway } from './PosterWord'

const c = Object.fromEntries((getTheme('gouache')?.palette ?? []).map(p => [p.name, p.value]))

// Gouache's palette, plus one over a photo
const colourways: Colourway[] = [
  { background: c.Green, fill: 'var(--color-accent)', stroke: c.Yellow, shadow: 'var(--color-ink)' },
  { background: c.Cyan, fill: c.Blue, shadow: 'var(--color-ink)' },
  { image: demoProjects[0].image, fill: c.Yellow, stroke: 'var(--color-accent)', shadow: 'var(--color-ink)' },
  { background: c.Violet, fill: c.Mint, stroke: 'var(--color-ink)', shadow: 'var(--color-ink)' },
  { background: c.Pink, fill: 'var(--color-paper)', stroke: 'var(--color-accent)', shadow: 'var(--color-accent)' },
]

export const controls: Control[] = [
  { name: 'text', label: 'Word', type: 'text', default: demoProjects[3].title },
  { name: 'way', label: 'Colourway', type: 'select', options: ['Random', '1', '2', '3', '4', '5'], default: 'Random' },
  { name: 'stroke', label: 'Stroke', type: 'range', min: 0, max: 0.03, step: 0.002, default: 0.008 },
  { name: 'shadow', label: 'Shadow offset', type: 'range', min: 0, max: 0.05, step: 0.002, default: 0.013 },
]

export default function Demo({ values }: DemoProps) {
  const way = String(values.way)
  return (
    <div className="flex min-h-[520px] flex-col">
      <PosterWord
        text={String(values.text) || 'Poster'}
        colourways={colourways}
        index={way === 'Random' ? undefined : Number(way) - 1}
        strokeWidth={Number(values.stroke)}
        shadowOffset={Number(values.shadow)}
        font="sans"
        className="flex flex-1 items-center px-[1.5vw] py-6"
      />
      <div className="flex items-end justify-between gap-6 bg-paper p-6">
        <p className="text-title max-w-[28ch]">A new colourway on every visit. Click the word to try the next one.</p>
        <span className="caption hidden text-muted md:block">SVG text · feOffset shadow</span>
      </div>
    </div>
  )
}
