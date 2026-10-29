import type { Control, DemoProps } from '@kit/lib/demo'
import TintedLetters from './TintedLetters'

export const controls: Control[] = [
  { name: 'text', label: 'Text', type: 'text', default: 'Small studio\nDigital-first design' },
  { name: 'runs', label: 'Runs at once', type: 'range', min: 1, max: 6, step: 1, default: 2 },
  { name: 'maxRun', label: 'Longest run', type: 'range', min: 1, max: 8, step: 1, default: 4 },
  { name: 'interval', label: 'Change every (ms)', type: 'range', min: 200, max: 2000, step: 50, default: 900 },
]

export default function Demo({ values }: DemoProps) {
  return (
    <div className="grid min-h-[480px] content-center px-6 py-12 md:px-12">
      <TintedLetters
        text={String(values.text).replace(/\\n/g, '\n')}
        runs={Number(values.runs)}
        maxRun={Number(values.maxRun)}
        interval={Number(values.interval)}
        colors={['#312dfb', '#f39a3c', '#2bc4d6']}
        className="font-display text-display leading-[1.05]"
      />
    </div>
  )
}
