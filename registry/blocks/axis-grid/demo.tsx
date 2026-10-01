import type { Control, DemoProps } from '@kit/lib/demo'
import MeltText from '@kit/blocks/melt-text/MeltText'
import { AxisGrid, AxisLine } from './AxisGrid'

export const controls: Control[] = [
  { name: 'axis', label: 'Axis on column line', type: 'range', min: 0, max: 7, step: 1, default: 3 },
  { name: 'guides', label: 'Show columns', type: 'toggle', default: false },
]

const lines: [number, string][] = [
  [2, 'I see design'],
  [4, 'as a constantly'],
  [3, 'evolving field,'],
  [4, 'shaped by new'],
  [2, 'techniques and'],
  [4, 'current trends.'],
]

export default function Demo({ values }: DemoProps) {
  return (
    <div className="px-4 py-14 md:px-8">
      <AxisGrid axis={Number(values.axis)} guides={Boolean(values.guides)}>
        {lines.map(([start, text]) => (
          <AxisLine key={text} start={start} className="text-headline">
            <MeltText as="span" immediate>
              {text}
            </MeltText>
          </AxisLine>
        ))}
      </AxisGrid>
    </div>
  )
}
