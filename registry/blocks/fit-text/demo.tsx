import type { Control, DemoProps } from '@kit/lib/demo'
import FitText from './FitText'

export const controls: Control[] = [{ name: 'text', label: 'Text', type: 'text', default: 'IVA PRESEČKI' }]

export default function Demo({ values }: DemoProps) {
  return (
    <div className="flex min-h-[320px] flex-col justify-end overflow-hidden pt-16">
      <FitText text={String(values.text)} className="px-3 pb-2 font-display font-medium tracking-[-0.05em]" />
    </div>
  )
}
