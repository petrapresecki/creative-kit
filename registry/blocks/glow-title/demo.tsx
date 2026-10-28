import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import GlowTitle from './GlowTitle'

export const controls: Control[] = [
  { name: 'text', label: 'Title', type: 'text', default: 'these are my 4 favourite projects of the year.' },
  { name: 'glow', label: 'Glow (px)', type: 'range', min: 0, max: 40, step: 1, default: 16 },
]

export default function Demo({ values }: DemoProps) {
  return (
    <div className="flex min-h-[360px] flex-col justify-center gap-5 bg-paper px-6 py-12 md:px-12">
      <GlowTitle glow={Number(values.glow)}>{String(values.text)}</GlowTitle>
      <p className="m-0 max-w-[52ch]">
        {demoProjects.map(p => p.title.toLowerCase()).join(' ♡ ')} ♡ made by hand, lit like a sign.
      </p>
    </div>
  )
}
