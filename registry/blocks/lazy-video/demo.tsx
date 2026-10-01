import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import LazyVideo from './LazyVideo'

export const controls: Control[] = [
  { name: 'project', label: 'Clip', type: 'select', options: demoProjects.map(p => p.title), default: 'Rool' },
]

export default function Demo({ values }: DemoProps) {
  const project = demoProjects.find(p => p.title === values.project) ?? demoProjects[0]
  return (
    <div className="p-6 md:p-10">
      <div data-media className="aspect-video overflow-hidden rounded-kit bg-mist">
        <LazyVideo src={project.video} className="h-full w-full object-cover" />
      </div>
    </div>
  )
}
