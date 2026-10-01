import type { Control, DemoProps } from '@kit/lib/demo'
import { demoText } from '@site/data/demo'
import ScrambleText from './ScrambleText'

export const controls: Control[] = [
  { name: 'text', label: 'Text', type: 'text', default: demoText.email },
  { name: 'charDelay', label: 'ms per letter', type: 'range', min: 10, max: 120, step: 5, default: 45 },
]

export default function Demo({ values }: DemoProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 p-10">
      <ScrambleText
        key={String(values.text) + values.charDelay}
        text={String(values.text)}
        play="mount"
        charDelay={Number(values.charDelay)}
        className="text-title"
      />
      <p className="caption text-muted">Hover to scramble again</p>
    </div>
  )
}
