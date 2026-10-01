import type { Control, DemoProps } from '@kit/lib/demo'
import DitherTrail from '@kit/blocks/dither-trail/DitherTrail'
import { Cell, CellGrid } from './CellGrid'

export const controls: Control[] = [{ name: 'trail', label: 'Effect behind window cells', type: 'toggle', default: true }]

export default function Demo({ values }: DemoProps) {
  return (
    <div className="relative">
      {values.trail ? <DitherTrail className="absolute inset-0 h-full w-full" /> : null}
      <CellGrid cols={4} rows="58fr 42fr" className="relative md:h-[600px]">
        <Cell colSpan={2}>
          <p className="caption">Portfolio 2025—26</p>
          <p className="max-w-[17ch] text-title">Graphic designer working across branding, packaging, motion and 3D.</p>
        </Cell>
        <Cell colSpan={2} rowSpan={2} tone="ink">
          <p className="caption">A big cell for the hero piece</p>
          <p className="text-lead text-paper/70">Spiral, video, anything</p>
        </Cell>
        <Cell tone="window" />
        <Cell tone="accent">
          <p className="text-headline">Hi! :)</p>
          <p className="caption">About me →</p>
        </Cell>
      </CellGrid>
    </div>
  )
}
