import { demoProjects } from '@site/data/demo'
import WorkIndex from './WorkIndex'

const items = demoProjects.map(p => ({ id: p.id, title: p.title, meta: p.category, year: p.year, preview: p.video }))

export default function Demo() {
  return (
    <div className="py-10">
      <WorkIndex items={items} />
    </div>
  )
}
