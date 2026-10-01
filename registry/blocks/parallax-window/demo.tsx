import { useRef } from 'react'
import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import ParallaxWindow from './ParallaxWindow'

export const controls: Control[] = [{ name: 'amount', label: 'Drift', type: 'range', min: 0.04, max: 0.3, step: 0.02, default: 0.14 }]

export default function Demo({ values }: DemoProps) {
  const scroller = useRef<HTMLDivElement>(null)
  return (
    <div ref={scroller} data-lenis-prevent className="h-[520px] overflow-y-auto">
      <p className="caption sticky top-0 z-10 bg-paper/80 p-4 backdrop-blur">Scroll inside this frame</p>
      <div className="grid grid-cols-2 gap-6 px-6 pt-[30vh] pb-[40vh] md:px-12">
        <ParallaxWindow key={String(values.amount)} scroller={scroller} amount={Number(values.amount)} src={demoProjects[0].image} className="aspect-[4/5]" />
        <ParallaxWindow key={'b' + values.amount} scroller={scroller} amount={Number(values.amount)} type="video" src={demoProjects[3].video} className="mt-[20vh] aspect-[4/5]" />
      </div>
    </div>
  )
}
