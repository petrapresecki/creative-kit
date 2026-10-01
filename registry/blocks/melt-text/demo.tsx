import type { Control, DemoProps } from '@kit/lib/demo'
import { demoText } from '@site/data/demo'
import MeltText from './MeltText'

export const controls: Control[] = [
  { name: 'text', label: 'Text', type: 'text', default: demoText.statement },
  { name: 'blur', label: 'Start blur', type: 'range', min: 10, max: 90, step: 5, default: 50 },
  { name: 'stagger', label: 'Line stagger (s)', type: 'range', min: 0, max: 0.4, step: 0.05, default: 0.1 },
]

export default function Demo({ values }: DemoProps) {
  return (
    <div className="flex min-h-[420px] items-center px-6 py-16 md:px-12">
      <MeltText
        key={JSON.stringify(values)}
        immediate
        blur={Number(values.blur)}
        stagger={Number(values.stagger)}
        className="max-w-[16ch] text-headline"
      >
        {String(values.text)}
      </MeltText>
    </div>
  )
}
