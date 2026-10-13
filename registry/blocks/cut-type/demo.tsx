import type { Control, DemoProps } from '@kit/lib/demo'
import CutType from './CutType'

export const controls: Control[] = [
  { name: 'text', label: 'Text', type: 'text', default: 'The Script.' },
  { name: 'top', label: 'Face on top', type: 'select', options: ['display', 'sans'], default: 'display' },
  { name: 'amount', label: 'Letters cut', type: 'range', min: 0, max: 1, step: 0.05, default: 0.45 },
  { name: 'seed', label: 'Seed', type: 'range', min: 1, max: 40, step: 1, default: 7 },
]

export default function Demo({ values }: DemoProps) {
  return (
    <div className="flex min-h-[460px] flex-col justify-center gap-6 px-6 py-14 md:px-12">
      <CutType
        key={JSON.stringify(values)}
        reveal
        text={String(values.text)}
        top={values.top as 'display' | 'sans'}
        amount={Number(values.amount)}
        seed={Number(values.seed)}
        className="text-display"
      />
      <CutType text="Adidas SLVR." seed={Number(values.seed) + 3} amount={Number(values.amount)} top={values.top as 'display' | 'sans'} className="self-end text-headline" />
      <p className="caption text-muted">Hover a word to re-cut it</p>
    </div>
  )
}
