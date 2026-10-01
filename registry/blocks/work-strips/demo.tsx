import { demoProjects } from '@site/data/demo'
import WorkStrips from './WorkStrips'

const items = demoProjects.map(p => ({ id: p.id, title: p.title, meta: `${p.category} · ${p.year}`, media: p.video }))

export default function Demo() {
  return <WorkStrips items={items} className="md:h-[600px]" />
}
