import { useState } from 'react'
import type { Control, DemoProps } from '@kit/lib/demo'
import { demoAbout, demoProjects, demoText } from '@site/data/demo'
import { getTheme } from '@site/data/themes'
import BlockMenu from './BlockMenu'

const c = Object.fromEntries((getTheme('gouache')?.palette ?? []).map(p => [p.name, p.value]))
const colors = [c.Violet, 'var(--color-mist)', 'var(--color-accent)', c.Pink]

export const controls: Control[] = [
  { name: 'colours', label: 'Palette colours', type: 'toggle', default: true },
  { name: 'size', label: 'Link size', type: 'select', options: ['headline', 'display'], default: 'headline' },
  { name: 'footer', label: 'Footer', type: 'toggle', default: true },
]

export default function Demo({ values }: DemoProps) {
  const [open, setOpen] = useState(true)
  const items = demoProjects.map((p, i) => ({ label: p.title, href: `#${p.id}`, color: values.colours ? colors[i] : undefined }))
  const links = [...demoAbout.services.map(s => ({ label: s.title })), { label: 'About' }, { label: 'Contact' }]
  return (
    <div className="relative h-[640px] overflow-hidden bg-paper">
      <header className="relative z-50 flex h-14 items-center justify-between bg-ink px-4 text-paper">
        <span className="text-title">Iva</span>
        <button
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          className="caption rounded-full bg-paper px-4 py-2 text-[14px] text-ink transition-colors hover:bg-accent"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </header>
      <div className="p-6">
        <p className="text-lead max-w-[24ch]">{demoText.statement}</p>
      </div>
      <BlockMenu
        open={open}
        onClose={() => setOpen(false)}
        onNavigate={() => setOpen(false)}
        items={items}
        links={links}
        size={values.size === 'display' ? 'display' : 'headline'}
        top={56}
        fixed={false}
        footer={
          values.footer ? (
            <div className="flex flex-wrap items-start justify-between gap-6">
              <ul className="flex flex-wrap gap-2">
                {demoAbout.contact.map(l => (
                  <li key={l}>
                    <a className="caption inline-block rounded-full border border-paper px-3 py-2 transition-colors hover:bg-paper hover:text-ink">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
              <a href={`mailto:${demoText.email}`} className="text-body underline underline-offset-4">
                {demoText.email}
              </a>
            </div>
          ) : undefined
        }
      />
    </div>
  )
}
