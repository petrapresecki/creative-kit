import { useRef, useState } from 'react'
import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import RollText from '@kit/blocks/roll-text/RollText'
import ColumnCurtain, { type CurtainHandle } from './ColumnCurtain'

export const controls: Control[] = [
  { name: 'columns', label: 'Columns', type: 'range', min: 2, max: 8, step: 1, default: 4 },
  { name: 'duration', label: 'Seconds per half', type: 'range', min: 0.3, max: 1.2, step: 0.05, default: 0.55 },
]

export default function Demo({ values }: DemoProps) {
  const curtain = useRef<CurtainHandle>(null)
  const [page, setPage] = useState(0)
  const project = demoProjects[page]
  const next = () => curtain.current?.run(() => setPage(p => (p + 1) % demoProjects.length))

  return (
    <div className="grid min-h-[420px] grid-cols-4 border-l border-ink">
      <ColumnCurtain ref={curtain} columns={Number(values.columns)} duration={Number(values.duration)} />
      {[0, 1, 2, 3].map(c => (
        <div key={c} className="border-r border-ink" />
      ))}
      <div className="col-span-4 -mt-[420px] flex min-h-[420px] flex-col justify-between p-6">
        <p className="caption">({String(page + 1).padStart(2, '0')}) {project.category}</p>
        <h3 className="text-display">{project.title}</h3>
        <button onClick={next} className="group w-fit rounded-full bg-accent px-5 py-2 text-[15px] font-medium">
          <RollText text="Next page →" />
        </button>
      </div>
    </div>
  )
}
