import RollText from '@kit/blocks/roll-text/RollText'
import { linkProps } from '@site/lib/router'
import { blocksInspiredBy } from '@site/data/registry'
import { KINDS, projects, type Pin } from '@site/data/inspo'

const verdictStyle = { love: 'bg-accent text-ink', maybe: 'bg-ink text-paper', nope: 'bg-[#e5402f] text-white' }

export default function PinCard({ pin, onImage, showProject }: { pin: Pin; onImage?: (pin: Pin) => void; showProject?: boolean }) {
  const built = blocksInspiredBy(pin.id)
  const host = pin.url ? new URL(pin.url).hostname.replace(/^www\./, '') : null
  return (
    <article className={`mb-4 break-inside-avoid overflow-hidden rounded-kit border border-ink/15 bg-paper transition-colors hover:border-ink ${pin.verdict === 'nope' ? 'opacity-70 hover:opacity-100' : ''}`}>
      {pin.image && (
        <button onClick={() => onImage?.(pin)} className="block w-full cursor-zoom-in bg-mist" aria-label={`Enlarge ${pin.title}`}>
          <img src={pin.image} alt={pin.title} loading="lazy" className="block h-auto w-full" />
        </button>
      )}
      <div className="grid gap-2 p-4">
        <p className="caption flex flex-wrap items-center gap-2 text-muted">
          <span className="rounded border border-current px-1.5">{KINDS[pin.kind]}</span>
          <span>{pin.section}</span>
          {pin.siteType && <span>· {pin.siteType}</span>}
          {showProject && <span>· {projects.find(p => p.id === pin.project)?.name}</span>}
        </p>
        <h3 className="text-[19px] leading-[1.15] font-medium tracking-[-0.03em] text-balance">{pin.title}</h3>
        {pin.note && <p className="text-[14px] leading-snug text-ink/80">{pin.note}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className={`caption rounded-full px-2 py-0.5 ${verdictStyle[pin.verdict]}`}>{pin.verdict}</span>
          {host && (
            <a href={pin.url} target="_blank" rel="noreferrer" className="text-[13px] underline underline-offset-4 hover:decoration-accent">
              {host} ↗
            </a>
          )}
          {built.map(b => (
            <a key={b.slug} {...linkProps(`/blocks/${b.slug}`)} className="group caption rounded-full border border-ink px-2 py-0.5 hover:bg-accent">
              <RollText text={`Block: ${b.title}`} />
            </a>
          ))}
        </div>
      </div>
    </article>
  )
}
