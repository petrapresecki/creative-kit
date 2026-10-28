import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import SilhouetteReadout, { objectShapes } from './SilhouetteReadout'

export const controls: Control[] = [
  { name: 'heading', label: 'List label', type: 'text', default: 'IN THE STUDIO:' },
  { name: 'own', label: 'Each shape its own image', type: 'toggle', default: true },
]

const [rool, apuro, booklet, gabagool] = demoProjects

export default function Demo({ values }: DemoProps) {
  const own = Boolean(values.own)
  const items = [
    { id: 'key', label: 'key', head: 'Branding', shape: objectShapes.key, image: rool.image, rows: [['project', rool.title], ['year', String(rool.year)], ['cards', String(rool.cards.length)]] },
    { id: 'bulb', label: 'idea', head: 'Packaging', shape: objectShapes.bulb, image: apuro.image, rows: [['project', apuro.title], ['year', String(apuro.year)]] },
    { id: 'metronome', label: 'pace', head: '4 a year', shape: objectShapes.metronome, image: gabagool.cards[1], rows: [['projects', '4'], ['per month', '0.33']] },
    { id: 'notes', label: 'tune', head: 'Editorial', shape: objectShapes.notes, image: booklet.image, rows: [['project', booklet.title], ['pages', '48']] },
    { id: 'speaker', label: 'voice', head: 'Motion', shape: objectShapes.speaker, image: gabagool.image, rows: [['project', gabagool.title], ['year', String(gabagool.year)]] },
    { id: 'drop', label: 'colour', head: 'tomato red', shape: objectShapes.drop, image: rool.cards[2], rows: [['hex', '#d8493a'], ['used in', '3 of 4']] },
  ].map(i => ({ ...i, rows: i.rows as [string, string][], image: own ? i.image : undefined }))
  return (
    <div className="bg-mist px-6 py-12 md:px-12">
      <p className="m-0">I taught my computer to sort</p>
      <h2 className="m-0 font-mono text-headline font-normal">a year in the studio</h2>
      <SilhouetteReadout items={items} image={booklet.image} heading={String(values.heading)} className="mt-6 max-w-[560px]" />
    </div>
  )
}
