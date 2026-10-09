import RollText from '@kit/blocks/roll-text/RollText'
import { linkProps, type Route } from '@site/lib/router'

const items: { page: Route['page']; href: string; label: string }[] = [
  { page: 'process', href: '/process', label: 'Process' },
  { page: 'guide', href: '/guide', label: 'Field guide' },
  { page: 'blocks', href: '/blocks', label: 'Blocks' },
  { page: 'themes', href: '/themes', label: 'Themes' },
  { page: 'grids', href: '/grids', label: 'Grids' },
  { page: 'inspo', href: '/inspo', label: 'Inspo' },
  { page: 'studies', href: '/studies', label: 'Studies' },
  { page: 'start', href: '/start', label: 'Start a site' },
]

export default function Nav({ page }: { page: Route['page'] }) {
  return (
    <header className="sticky top-0 z-50 border-b border-ink bg-paper/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-5">
        <a {...linkProps('/')} className="group flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]">
          <span className="size-3 bg-accent" />
          <RollText text="creative-kit" />
        </a>
        <nav className="flex gap-1 overflow-x-auto">
          {items.map(item => (
            <a
              key={item.page}
              {...linkProps(item.href)}
              aria-current={page === item.page ? 'page' : undefined}
              className={`group rounded-full px-3 py-1.5 text-[14px] font-medium whitespace-nowrap transition-colors ${
                page === item.page ? 'bg-ink text-paper' : 'hover:bg-accent'
              }`}
            >
              <RollText text={item.label} />
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
