import type { Control, DemoProps } from '@kit/lib/demo'
import { demoAbout, demoProjects, demoText } from '@site/data/demo'
import onyx from '@themes/onyx.json'
import DropNav, { CaretRule, SheetRow, type StripeRow } from './DropSheet'

export const controls: Control[] = [
  { name: 'marquee', label: 'Marquee', type: 'text', default: 'projects guide' },
  { name: 'stripe', label: 'Colour stripe', type: 'toggle', default: true },
]

const c = Object.fromEntries(onyx.palette.map(p => [p.name, p.value]))
const stripe: StripeRow[] = [
  [[c.Magenta, 26], [c.Ocean, 28], [c.Cobalt, 17], [c.Mustard, 10], [c['Lilac grey'], 19]],
  [[c['Lilac grey'], 11], [c.Azure, 13], [c.Violet, 38], [c.Grass, 13], [c['Signal red'], 25]],
]

const glyphs = [
  <span key="c" className="size-5 rounded-full bg-current" />,
  <span key="s" className="size-5 bg-current" />,
  <span key="t" className="size-0 border-x-[11px] border-b-[20px] border-x-transparent border-b-current" />,
  <span key="d" className="size-4 rotate-45 bg-current" />,
]

export default function Demo({ values }: DemoProps) {
  const sheets = [
    {
      id: 'catalog',
      label: 'Catalog',
      content: (
        <>
          <CaretRule className="mb-2 text-[15px]" />
          {demoProjects.map((p, i) => (
            <SheetRow key={p.id} icon={glyphs[i % glyphs.length]} name={p.title.toLowerCase()} meta={p.category.toLowerCase()} year={p.year} />
          ))}
        </>
      ),
    },
    {
      id: 'info',
      label: 'Info',
      content: (
        <>
          <CaretRule className="mb-6 text-[15px]" />
          <p className="mx-auto max-w-[52ch] text-center">{demoText.approach.toLowerCase()}</p>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {demoAbout.services.map(s => (
              <div key={s.title}>
                <p className="font-medium italic">{s.title.toLowerCase()}</p>
                {s.items.map(item => (
                  <p key={item} className="font-light">
                    {item.toLowerCase()}
                  </p>
                ))}
              </div>
            ))}
          </div>
          <CaretRule className="mt-8 text-[15px]" />
          <p className="flex justify-between py-2 italic">
            {demoAbout.contact.map(x => (
              <span key={x} className="underline">
                {x.toLowerCase()}
              </span>
            ))}
          </p>
          <CaretRule className="text-[15px]" />
        </>
      ),
    },
  ]

  return (
    // transform makes the dimming overlay cover the demo instead of the whole showcase
    <div className="relative min-h-[680px] overflow-hidden bg-paper pt-2 text-ink [transform:translateZ(0)]">
      <DropNav brand="Iva Presečki" sheets={sheets} marquee={String(values.marquee) || undefined} stripe={values.stripe ? stripe : undefined} />
      <div className="grid grid-cols-2 gap-3 px-3 pt-16 md:grid-cols-4 md:px-4">
        {demoProjects.map(p => (
          <img key={p.id} src={p.image} alt="" className="aspect-[3/4] w-full object-cover" />
        ))}
      </div>
    </div>
  )
}
