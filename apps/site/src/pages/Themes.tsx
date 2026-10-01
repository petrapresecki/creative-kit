import MeltText from '@kit/blocks/melt-text/MeltText'
import RollText from '@kit/blocks/roll-text/RollText'
import Marquee from '@kit/blocks/marquee/Marquee'
import { Cell, CellGrid } from '@kit/blocks/cell-grid/CellGrid'
import { themes, getTheme, cssFor, type Theme } from '@site/data/themes'
import { getPin } from '@site/data/inspo'
import { linkProps } from '@site/lib/router'
import ThemeScope from '@site/components/ThemeScope'
import Command from '@site/components/Command'
import CopyButton from '@site/components/CopyButton'

/** Plot a cubic-bezier easing as a small curve. */
function EaseCurve({ name, value }: { name: string; value: string }) {
  const [x1, y1, x2, y2] = value.match(/-?[\d.]+/g)!.map(Number)
  const s = 120
  const p = (x: number, y: number) => `${x * s},${s - y * s}`
  return (
    <figure className="grid gap-2">
      <svg viewBox={`-6 -14 ${s + 12} ${s + 28}`} className="w-full max-w-[140px]" aria-label={`${name} easing curve`}>
        <rect x="0" y="0" width={s} height={s} fill="none" stroke="currentColor" strokeOpacity="0.15" />
        <path d={`M${p(0, 0)} C${p(x1, y1)} ${p(x2, y2)} ${p(1, 1)}`} fill="none" stroke="currentColor" strokeWidth="2.5" />
        <line x1={0} y1={s} x2={x1 * s} y2={s - y1 * s} stroke="var(--color-accent)" strokeWidth="1.5" />
        <line x1={s} y1={0} x2={x2 * s} y2={s - y2 * s} stroke="var(--color-accent)" strokeWidth="1.5" />
      </svg>
      <figcaption className="caption">
        {name}
        <span className="mt-1 block font-mono text-[10px] normal-case text-muted">{value}</span>
      </figcaption>
    </figure>
  )
}

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="grid gap-2">
      <div className="aspect-square rounded-kit border border-ink/15" style={{ background: value }} />
      <div className="flex items-center justify-between gap-2">
        <span className="caption">{name}</span>
        <CopyButton text={value} label={value} className="!px-2 !py-0.5 font-mono !text-[10px] normal-case" />
      </div>
    </div>
  )
}

function ThemeDetail({ theme }: { theme: Theme }) {
  const fonts = Object.entries(theme.fonts).filter(([, f]) => f)
  return (
    <article>
      <ThemeScope theme={theme} className="border-b border-ink">
        <div className="px-4 pt-12 pb-10 md:px-5">
          <p className="caption">
            <a {...linkProps('/themes')} className="hover:underline">Themes</a> / {theme.name}
          </p>
          <h1 className="mt-4 font-display text-display">{theme.name}</h1>
          <p className="mt-6 max-w-[48ch] text-lead">{theme.description}</p>
        </div>

        <section className="grid gap-10 border-t border-ink px-4 py-12 md:grid-cols-12 md:px-5">
          <h2 className="caption md:col-span-3">Colour</h2>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 md:col-span-9">
            {Object.entries(theme.colors).map(([k, v]) => (
              <Swatch key={k} name={k} value={v} />
            ))}
            {theme.palette?.map(c => (
              <Swatch key={c.name} name={c.name} value={c.value} />
            ))}
          </div>
        </section>

        <section className="grid gap-10 border-t border-ink px-4 py-12 md:grid-cols-12 md:px-5">
          <h2 className="caption md:col-span-3">Type</h2>
          <div className="grid gap-8 md:col-span-9">
            <div className="grid gap-4 sm:grid-cols-3">
              {fonts.map(([role, f]) => (
                <div key={role} className="rounded-kit border border-ink/15 p-4">
                  <p className="caption text-muted">{role}</p>
                  <p className="mt-2 text-[44px] leading-none" style={{ fontFamily: `"${f!.family}", ${f!.fallback}` }}>
                    Aa Gg 26
                  </p>
                  <p className="mt-3 text-[14px]">{f!.family}</p>
                </div>
              ))}
            </div>
            <ul className="grid gap-6">
              {theme.type.map(t => (
                <li key={t.name} className="grid gap-2 border-t border-ink/15 pt-4">
                  <p className="caption flex flex-wrap gap-x-4 text-muted">
                    <span className="text-ink">text-{t.name}</span>
                    <span>{t.size}</span>
                    <span>leading {t.leading}</span>
                    <span>tracking {t.tracking}</span>
                    <span>weight {t.weight}</span>
                  </p>
                  <p
                    className={`${t.font === 'display' ? 'font-display' : t.font === 'mono' ? 'font-mono' : ''} max-w-full overflow-hidden text-ellipsis whitespace-nowrap`}
                    style={{ fontSize: t.size, lineHeight: t.leading, letterSpacing: t.tracking, fontWeight: t.weight }}
                  >
                    Branding, packaging, motion
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid gap-10 border-t border-ink px-4 py-12 md:grid-cols-12 md:px-5">
          <h2 className="caption md:col-span-3">Motion & shape</h2>
          <div className="flex flex-wrap gap-10 md:col-span-9">
            {Object.entries(theme.ease).map(([k, v]) => (
              <EaseCurve key={k} name={k} value={v} />
            ))}
            <figure className="grid gap-2">
              <div className="size-[120px] border border-ink bg-accent" style={{ borderRadius: theme.radius === '999px' ? '40px' : theme.radius }} />
              <figcaption className="caption">
                radius
                <span className="mt-1 block font-mono text-[10px] normal-case text-muted">{theme.radius}</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="border-t border-ink">
          <h2 className="caption px-4 py-4 md:px-5">In use</h2>
          <CellGrid cols={4} rows="1fr 1fr" className="border-l-0 md:h-[520px]">
            <Cell colSpan={2}>
              <p className="caption">({theme.name}) Portfolio</p>
              <p className="font-display text-headline">Selected work</p>
            </Cell>
            <Cell tone="accent">
              <p className="caption">Accent cell</p>
              <button className="group w-fit rounded-full bg-ink px-5 py-2 text-paper" style={{ borderRadius: theme.radius }}>
                <RollText text="Open project →" />
              </button>
            </Cell>
            <Cell tone="ink">
              <p className="caption text-paper/70">Ink cell</p>
              <p className="text-title text-paper">Hi! :)</p>
            </Cell>
            <Cell colSpan={4} tone="mist" className="!justify-center overflow-hidden !px-0">
              <Marquee duration={26}>
                <span className="pr-10 font-display text-headline whitespace-nowrap">Branding ✺ Packaging ✺ Motion ✺ 3D ✺</span>
              </Marquee>
            </Cell>
          </CellGrid>
        </section>
      </ThemeScope>

      <section className="grid gap-8 px-4 py-12 md:grid-cols-12 md:px-5">
        <div className="grid content-start gap-3 md:col-span-4">
          <h2 className="caption">Use it in a project</h2>
          <Command>{`pnpm kit theme ${theme.id} --to ../my-site`}</Command>
          <p className="text-[14px] text-ink/70">Writes src/styles/theme.css and adds the font link to index.html.</p>
          {theme.inspiredBy?.length ? (
            <p className="text-[14px] text-ink/70">
              Inspired by:{' '}
              {theme.inspiredBy.map(id => getPin(id)?.title).filter(Boolean).join(' · ')}
            </p>
          ) : null}
        </div>
        <pre className="max-h-[420px] overflow-auto rounded-kit border border-ink bg-mist p-4 font-mono text-[12px] leading-relaxed md:col-span-8">{cssFor(theme)}</pre>
      </section>
    </article>
  )
}

export default function Themes({ id }: { id?: string }) {
  const theme = getTheme(id)
  if (theme) return <ThemeDetail theme={theme} />
  return (
    <div className="pt-12">
      <div className="px-4 pb-10 md:px-5">
        <p className="caption text-muted">{themes.length} themes</p>
        <MeltText as="h1" immediate className="mt-3 text-display">
          Themes
        </MeltText>
        <p className="mt-6 max-w-[54ch] text-lead text-ink/80">
          Colours, fonts, type scale, easing and radius as one file each. Every block is styled from these tokens, so switching the theme restyles everything.
        </p>
      </div>
      <div className="grid border-t border-ink md:grid-cols-2">
        {themes.map(t => (
          <a key={t.id} {...linkProps(`/themes/${t.id}`)} className="group block border-b border-ink md:odd:border-r">
            <ThemeScope theme={t} className="flex h-[420px] flex-col justify-between p-5">
              <div className="flex justify-between">
                <p className="caption">{t.name}</p>
                <p className="caption">{t.fonts.display?.family ?? t.fonts.sans.family}</p>
              </div>
              <p className="font-display text-headline">
                <RollText text={t.name} />
              </p>
              <div className="flex items-end justify-between gap-6">
                <p className="max-w-[40ch] text-[14px] leading-snug">{t.description}</p>
                <div className="flex shrink-0 gap-1">
                  {Object.values(t.colors).map(v => (
                    <span key={v} className="size-7 rounded-full border border-ink/20" style={{ background: v }} />
                  ))}
                </div>
              </div>
            </ThemeScope>
          </a>
        ))}
      </div>
    </div>
  )
}
