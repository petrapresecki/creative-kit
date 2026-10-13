import { useRef } from 'react'
import type { Control, DemoProps } from '@kit/lib/demo'
import PullApartHeading from './PullApartHeading'

export const controls: Control[] = [
  { name: 'left', label: 'Left', type: 'text', default: 'Work' },
  { name: 'right', label: 'Right', type: 'text', default: '25—26' },
]

export default function Demo({ values }: DemoProps) {
  const scroller = useRef<HTMLDivElement>(null)
  return (
    <div ref={scroller} data-lenis-prevent className="h-[480px] overflow-y-auto">
      <p className="caption p-4">Scroll inside this frame</p>
      <div className="px-6 pt-[460px] pb-[50vh] md:px-12">
        <PullApartHeading key={`${values.left}${values.right}`} scroller={scroller} left={String(values.left)} right={String(values.right)} className="text-headline" />
      </div>
    </div>
  )
}
