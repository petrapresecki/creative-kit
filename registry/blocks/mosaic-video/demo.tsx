import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import MosaicVideo from './MosaicVideo'

export const controls: Control[] = [
  { name: 'cell', label: 'Cell (px)', type: 'range', min: 16, max: 96, step: 4, default: 48 },
  { name: 'patches', label: 'Patches', type: 'range', min: 1, max: 8, step: 1, default: 3 },
  { name: 'interval', label: 'Move every (ms)', type: 'range', min: 120, max: 1500, step: 20, default: 420 },
]

export default function Demo({ values }: DemoProps) {
  return (
    <MosaicVideo
      src={demoProjects[1].video}
      poster={demoProjects[1].image}
      cell={Number(values.cell)}
      patches={Number(values.patches)}
      interval={Number(values.interval)}
      className="h-[560px]"
    >
      <p className="absolute bottom-6 left-6 font-display text-headline text-white mix-blend-difference md:left-10">Digital-first studio</p>
    </MosaicVideo>
  )
}
