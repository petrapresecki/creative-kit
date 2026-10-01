import { demoProjects } from '@site/data/demo'
import WorkRows from './WorkRows'

const items = demoProjects.map(p => ({ id: p.id, title: p.title, meta: p.category, year: p.year, media: [p.video, p.cards[1], p.cards[2]] }))

export default function Demo() {
  return <WorkRows items={items} />
}
