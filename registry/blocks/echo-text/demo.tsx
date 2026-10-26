import { useRef } from 'react'
import type { Control, DemoProps } from '@kit/lib/demo'
import EchoText from './EchoText'

export const controls: Control[] = [
  { name: 'copies', label: 'Copies', type: 'range', min: 1, max: 24, step: 1, default: 10 },
  { name: 'dx', label: 'Offset x (px)', type: 'range', min: -12, max: 12, step: 1, default: 2 },
  { name: 'dy', label: 'Offset y (px)', type: 'range', min: 0, max: 24, step: 1, default: 7 },
  { name: 'fade', label: 'Deepest copy opacity', type: 'range', min: 0, max: 1, step: 0.05, default: 0.35 },
]

export default function Demo({ values }: DemoProps) {
  const scroller = useRef<HTMLDivElement>(null)
  const props = { copies: Number(values.copies), dx: Number(values.dx), dy: Number(values.dy), fade: Number(values.fade), scroller }
  return (
    <div ref={scroller} data-lenis-prevent className="h-[520px] overflow-y-auto">
      <p className="caption p-4">Scroll inside this frame</p>
      <div className="grid gap-[28vh] px-6 pt-[30vh] pb-[70vh] md:px-12">
        <EchoText {...props} as="h2" className="font-display text-headline">
          Closeness, visible everywhere
        </EchoText>
        <EchoText {...props} spread={1.4} copies={1} dy={0} fade={0} className="text-title md:ml-[30%]">
          Fear
        </EchoText>
        <EchoText {...props} className="text-lead max-w-[28ch] md:ml-[12%]">
          After every reel I hope something comes along that actually reaches me.
        </EchoText>
      </div>
    </div>
  )
}
