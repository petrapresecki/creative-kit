import { useRef } from 'react'
import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects, demoText } from '@site/data/demo'
import CutType from '@kit/blocks/cut-type/CutType'
import PortalCard from './PortalCard'

export const controls: Control[] = [{ name: 'duration', label: 'Open (s)', type: 'range', min: 0.4, max: 2.4, step: 0.1, default: 1.1 }]

export default function Demo({ values }: DemoProps) {
  const scroller = useRef<HTMLDivElement>(null)
  return (
    <div ref={scroller} data-lenis-prevent className="h-[560px] overflow-y-auto">
      <div className="grid min-h-[900px] content-start gap-10 px-6 pt-10 pb-40 md:px-12">
        <p className="caption">Scroll: the world behind stays still. Click the card to go through</p>
        <CutType text="Studio / Digital Design." className="max-w-[12ch] text-headline" />
        <PortalCard scroller={scroller} duration={Number(values.duration)} label="About →" className="aspect-[3/4] w-[220px] justify-self-center">
          <div className="relative h-full w-full bg-ink text-paper">
            <img src={demoProjects[3].image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50 grayscale" />
            <div className="relative grid h-full content-end gap-6 p-6 md:p-12">
              <p className="caption">About</p>
              <p className="font-display text-headline">Big bang.</p>
              <p className="max-w-[40ch] text-lead">{demoText.statement}</p>
            </div>
          </div>
        </PortalCard>
        <p className="max-w-[44ch] text-lead">{demoText.approach}</p>
      </div>
    </div>
  )
}
