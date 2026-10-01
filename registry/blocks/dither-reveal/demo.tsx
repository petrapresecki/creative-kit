import { useState } from 'react'
import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import DitherReveal from './DitherReveal'

export const controls: Control[] = [
  { name: 'dot', label: 'Dot size (px)', type: 'range', min: 1, max: 6, step: 1, default: 3 },
  { name: 'brush', label: 'Brush (px)', type: 'range', min: 24, max: 180, step: 4, default: 90 },
  { name: 'interval', label: 'Seconds per slide', type: 'range', min: 2, max: 10, step: 0.5, default: 4.5 },
]

const slides = demoProjects.map(p => p.image)

export default function Demo({ values }: DemoProps) {
  const [slide, setSlide] = useState(0)
  return (
    <div className="relative h-[560px]">
      <DitherReveal
        slides={slides}
        dot={Number(values.dot)}
        brush={Number(values.brush)}
        interval={Number(values.interval)}
        onSlide={setSlide}
        className="absolute inset-0 h-full w-full"
      />
      <p className="caption pointer-events-none absolute top-3 left-3 bg-paper px-1.5 py-0.5">
        ({String(slide + 1).padStart(2, '0')}) {demoProjects[slide].title} — move the mouse over it
      </p>
    </div>
  )
}
